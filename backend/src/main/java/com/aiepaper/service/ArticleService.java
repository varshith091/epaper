package com.aiepaper.service;

import com.aiepaper.entity.Article;
import com.aiepaper.entity.Newspaper;
import com.aiepaper.repository.ArticleRepository;
import com.aiepaper.repository.NewspaperRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final NewspaperRepository newspaperRepository;
    private final NewspaperProcessorService newspaperProcessorService;

    public List<Article> searchByHeadline(String headline) {
        return articleRepository.findByHeadlineContainingIgnoreCaseOrderByIdDesc(headline);
    }

    public List<Article> getAllArticles() {
        return articleRepository.findAllByOrderByIdDesc();
    }

    public Article save(Article article) {
        return articleRepository.save(article);
    }

    public List<Article> searchByKeyword(String keyword) {
        return articleRepository.findByContentContainingIgnoreCaseOrderByIdDesc(keyword);
    }

    public List<Article> getByCategory(String category) {
        if ("ALL".equalsIgnoreCase(category)) {
            return articleRepository.findAllByOrderByIdDesc();
        }
        return articleRepository.findByCategoryIgnoreCaseOrderByIdDesc(category);
    }

    public List<Article> getByNewspaper(Long newspaperId, String category) {
        List<Article> existing = articleRepository.findByNewspaperIdOrderByIdDesc(newspaperId);

        // If no articles exist yet for this newspaper, auto-extract on the fly!
        if (existing.isEmpty()) {
            log.info("No articles in DB for newspaper ID {}. Triggering auto-processor...", newspaperId);
            Newspaper newspaper = newspaperRepository.findById(newspaperId).orElse(null);
            if (newspaper != null) {
                newspaperProcessorService.processNewspaper(newspaper);
                existing = articleRepository.findByNewspaperIdOrderByIdDesc(newspaperId);
            }
        }

        if (category != null && !category.isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            List<Article> filtered = articleRepository.findByNewspaperIdAndCategoryIgnoreCaseOrderByIdDesc(newspaperId, category);
            if (!filtered.isEmpty()) {
                return filtered;
            }
        }

        return existing;
    }
}
