package com.aiepaper.controller;

import com.aiepaper.entity.SavedArticle;
import com.aiepaper.service.SavedArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class SavedArticleController {

    private final SavedArticleService service;

    @PostMapping
    public SavedArticle save(
            @RequestBody SavedArticle article
    ) {
        return service.save(article);
    }

    @GetMapping
    public List<SavedArticle> getAll() {
        return service.getAll();
    }
    @DeleteMapping("/{id}")
public void delete(
        @PathVariable Long id
) {
    service.delete(id);
}
}