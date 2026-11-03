package com.aiepaper.service;

import com.aiepaper.entity.SavedArticle;
import com.aiepaper.repository.SavedArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedArticleService {

    private final SavedArticleRepository repository;

    public SavedArticle save(
            SavedArticle article
    ) {
        return repository.save(article);
    }

    public List<SavedArticle> getAll() {
        return repository.findAll();
    }
    public void delete(Long id) {
    repository.deleteById(id);
}
}