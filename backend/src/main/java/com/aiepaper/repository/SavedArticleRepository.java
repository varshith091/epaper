package com.aiepaper.repository;

import com.aiepaper.entity.SavedArticle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedArticleRepository
        extends JpaRepository<SavedArticle, Long> {
}