package com.aiepaper.controller;

import com.aiepaper.entity.Article;
import com.aiepaper.service.ArticleService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public List<Article> getAllArticles() {
        return articleService.getAllArticles();
    }

    @GetMapping("/search/headline")
    public List<Article> searchByHeadline(
            @RequestParam String headline
    ) {
        return articleService.searchByHeadline(headline);
    }

    @GetMapping("/search/keyword")
    public List<Article> searchByKeyword(
            @RequestParam String keyword
    ) {
        return articleService.searchByKeyword(keyword);
    }

    @GetMapping("/category")
    public List<Article> getByCategory(
            @RequestParam String category
    ) {
        return articleService.getByCategory(category);
    }

    @GetMapping("/newspaper/{newspaperId}")
    public List<Article> getByNewspaper(
            @PathVariable Long newspaperId,
            @RequestParam(required = false) String category
    ) {
        return articleService.getByNewspaper(newspaperId, category);
    }
}
