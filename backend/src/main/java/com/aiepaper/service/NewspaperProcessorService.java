package com.aiepaper.service;

import com.aiepaper.entity.Article;
import com.aiepaper.entity.Newspaper;
import com.aiepaper.ocr.PdfExtractionService;
import com.aiepaper.repository.ArticleRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NewspaperProcessorService {

    private final PdfExtractionService pdfExtractionService;
    private final ArticleSplitterService articleSplitterService;
    private final ArticleRepository articleRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public int processNewspaper(Newspaper newspaper) {
        if (newspaper == null || newspaper.getFilePath() == null) {
            log.warn("Newspaper or filePath is null");
            return 0;
        }

        File pdfFile = new File(newspaper.getFilePath());
        if (!pdfFile.exists()) {
            log.warn("PDF file not found on disk: {}", pdfFile.getAbsolutePath());
            return 0;
        }

        int savedCount = 0;

        // Step 1: Attempt standard digital text extraction
        try {
            log.info("Attempting standard text extraction for: {}", pdfFile.getName());
            String extractedText = pdfExtractionService.extractText(pdfFile.getAbsolutePath());
            if (extractedText != null) {
                extractedText = extractedText
                        .replace("\u0000", "")
                        .replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", "");
            }

            if (extractedText != null && extractedText.trim().length() >= 100) {
                log.info("Found digital text ({} chars). Splitting articles...", extractedText.length());
                List<String> splitArticles = articleSplitterService.splitArticles(extractedText);

                for (String rawContent : splitArticles) {
                    String cleanContent = cleanRawArticle(rawContent);
                    String headline = extractHeadline(cleanContent, newspaper.getTitle());
                    if (cleanContent.startsWith(headline)) {
                        cleanContent = cleanContent.substring(headline.length()).trim();
                    }

                    String category = detectCategory(cleanContent + " " + headline, newspaper.getCategory());

                    Article article = Article.builder()
                            .headline(headline)
                            .content(cleanContent.isEmpty() ? rawContent : cleanContent)
                            .pageNumber(1)
                            .category(category)
                            .newspaper(newspaper)
                            .build();

                    articleRepository.save(article);
                    savedCount++;
                }

                if (savedCount > 0) {
                    log.info("Successfully saved {} digital articles for newspaper ID {}", savedCount, newspaper.getId());
                    return savedCount;
                }
            }
        } catch (Exception e) {
            log.warn("Standard text extraction produced no usable text: {}", e.getMessage());
        }

        // Step 2: Fallback for Scanned / Raster image PDFs (e.g., Prabhat Khabar)
        log.info("Standard text extraction was empty or minimal. Using PDFBox + Gemini Vision OCR for {}", pdfFile.getName());
        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            PDFRenderer renderer = new PDFRenderer(document);
            int maxPages = Math.min(document.getNumberOfPages(), 2);

            for (int pageIdx = 0; pageIdx < maxPages; pageIdx++) {
                try {
                    log.info("Rendering page {} for Gemini Vision OCR...", pageIdx);
                    BufferedImage image = renderer.renderImageWithDPI(pageIdx, 140);
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    ImageIO.write(image, "JPEG", baos);
                    byte[] imageBytes = baos.toByteArray();

                    String geminiJson = geminiService.extractArticlesFromImage(imageBytes);
                    if (geminiJson != null && !geminiJson.trim().isEmpty()) {
                        String cleanJson = geminiJson.trim();
                        if (cleanJson.startsWith("```json")) {
                            cleanJson = cleanJson.substring(7);
                        }
                        if (cleanJson.startsWith("```")) {
                            cleanJson = cleanJson.substring(3);
                        }
                        if (cleanJson.endsWith("```")) {
                            cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
                        }
                        cleanJson = cleanJson.trim();

                        List<Map<String, Object>> parsedArticles = objectMapper.readValue(
                                cleanJson,
                                new TypeReference<List<Map<String, Object>>>() {}
                        );

                        for (Map<String, Object> item : parsedArticles) {
                            String headline = (String) item.getOrDefault("headline", newspaper.getTitle());
                            String content = (String) item.getOrDefault("content", "");
                            String cat = (String) item.getOrDefault("category", newspaper.getCategory() != null ? newspaper.getCategory() : "General");

                            if (content.length() > 20 || headline.length() > 10) {
                                Article article = Article.builder()
                                        .headline(headline)
                                        .content(content)
                                        .pageNumber(pageIdx + 1)
                                        .category(cat)
                                        .newspaper(newspaper)
                                        .build();

                                articleRepository.save(article);
                                savedCount++;
                            }
                        }
                    }
                } catch (Exception pageEx) {
                    log.error("Failed extracting page {} of newspaper ID {}: {}", pageIdx, newspaper.getId(), pageEx.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Scanned PDF Vision extraction failed: {}", e.getMessage(), e);
        }

        // Step 3: Absolute fallback safety net if vision is completely unreachable
        if (savedCount == 0) {
            log.warn("Vision returned 0 items; creating default overview article for {}", newspaper.getTitle());
            Article fallback = Article.builder()
                    .headline(newspaper.getTitle() + " - " + (newspaper.getEdition() != null ? newspaper.getEdition() : "Daily Edition"))
                    .content("Full edition coverage for " + newspaper.getTitle() + ". "
                            + (newspaper.getPublisher() != null ? "Published by " + newspaper.getPublisher() + ". " : "")
                            + "Select this edition to view articles, study sheets, and AI audio briefings.")
                    .pageNumber(1)
                    .category(newspaper.getCategory() != null ? newspaper.getCategory() : "General")
                    .newspaper(newspaper)
                    .build();
            articleRepository.save(fallback);
            savedCount++;
        }

        log.info("Completed processing newspaper ID {}. Total articles saved: {}", newspaper.getId(), savedCount);
        return savedCount;
    }

    private String cleanRawArticle(String raw) {
        String clean = raw;
        int qrIdx = clean.toLowerCase().indexOf("scan qr code");
        if (qrIdx != -1) {
            clean = clean.substring(qrIdx + "scan qr code".length());
        } else {
            int subIdx = clean.toLowerCase().indexOf("to subscribe");
            if (subIdx != -1) {
                int periodAfter = clean.indexOf(".", subIdx);
                if (periodAfter != -1 && periodAfter - subIdx < 120) {
                    clean = clean.substring(periodAfter + 1);
                }
            }
        }
        return clean.replaceAll("([a-zA-Z]+)[-\\u2010-\\u2014]\\s*([a-zA-Z]+)", "$1$2")
                .replaceAll("\\bI\\s+n\\s+", "In ")
                .trim();
    }

    private String extractHeadline(String content, String defaultHeadline) {
        if (content == null || content.isEmpty()) return defaultHeadline;
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("^([\\s\\S]*?[.!?])(\\s+|$)").matcher(content);
        if (matcher.find() && matcher.group(1).trim().length() > 15) {
            return matcher.group(1).trim();
        }
        return defaultHeadline;
    }

    private String detectCategory(String text, String defaultCategory) {
        if (text == null) return defaultCategory != null ? defaultCategory : "General";
        String lower = text.toLowerCase();
        if (lower.matches("(?s).*\\b(investment|investments|shares|stocks|market|sensex|nifty|rupee|inflation|gdp|rbi|revenue|profit|deficit|company|companies|corporate|firm|firms|subsidiary|subsidiaries|tender|tenders|bid|procurement|power sector|energy|trade|industry|economic|economy|business|commercial|manufacturer|finance ministry)\\b.*")) {
            return "Business";
        }
        if (lower.matches("(?s).*\\b(minister|parliament|lok sabha|rajya sabha|bjp|congress|election|vote|voters|cabinet|policy|supreme court|prime minister|chief minister|mla|mp|constituency|governor|court|assembly)\\b.*")) {
            return "Politics";
        }
        if (lower.matches("(?s).*\\b(cricket|football|olympics|badminton|hockey|tennis|fifa|ipl|golf|tournament|championship|wicket|inning|batsman|bowler|striker|goalkeeper|athlete|medalist|trophy|match score|premier league|world cup)\\b.*")) {
            return "Sports";
        }
        return (defaultCategory != null && !defaultCategory.trim().isEmpty()) ? defaultCategory : "General";
    }
}
