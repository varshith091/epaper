package com.aiepaper.controller;

import com.aiepaper.entity.Newspaper;
import com.aiepaper.repository.NewspaperRepository;
import com.aiepaper.service.NewspaperProcessorService;
import com.aiepaper.service.NewspaperService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/newspapers")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@Slf4j
public class NewspaperController {

    private final NewspaperService newspaperService;
    private final NewspaperRepository newspaperRepository;
    private final NewspaperProcessorService newspaperProcessorService;

    @GetMapping("/test")
    public String test() {
        return "Newspaper API is working";
    }

    @GetMapping
    public List<Newspaper> getAllNewspapers() {
        return newspaperService.getAllNewspapers();
    }

    @PostMapping(
            value = "/upload",
            consumes = "multipart/form-data"
    )
    public Newspaper uploadNewspaper(
            @RequestParam("file") MultipartFile file,
            @RequestParam String title,
            @RequestParam String publisher,
            @RequestParam String edition,
            @RequestParam(required = false, defaultValue = "General") String category
    ) throws IOException {

        log.info("UPLOAD API HIT: {}", file.getOriginalFilename());

        String uploadDir = "C:/epaper/uploads/";
        File folder = new File(uploadDir);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File destination = new File(folder, fileName);
        log.info("Saving file to: {}", destination.getAbsolutePath());
        file.transferTo(destination);

        Newspaper newspaper = Newspaper.builder()
                .title(title)
                .publisher(publisher)
                .edition(edition)
                .category(category)
                .fileName(fileName)
                .filePath(destination.getAbsolutePath())
                .uploadedAt(LocalDateTime.now())
                .build();

        newspaper = newspaperService.save(newspaper);

        // Process articles automatically (Standard OCR + Scanned Gemini Vision fallback)
        try {
            int count = newspaperProcessorService.processNewspaper(newspaper);
            log.info("Extracted and saved {} articles for uploaded newspaper ID {}", count, newspaper.getId());
        } catch (Exception e) {
            log.error("Failed processing newspaper after upload: {}", e.getMessage(), e);
        }

        return newspaper;
    }

    @PostMapping("/{id}/extract")
    public ResponseEntity<?> extractNewspaperArticles(@PathVariable Long id) {
        Newspaper newspaper = newspaperRepository.findById(id).orElse(null);
        if (newspaper == null) {
            return ResponseEntity.notFound().build();
        }
        int count = newspaperProcessorService.processNewspaper(newspaper);
        return ResponseEntity.ok(java.util.Map.of(
                "newspaperId", id,
                "newspaperTitle", newspaper.getTitle(),
                "articlesProcessed", count
        ));
    }
}
