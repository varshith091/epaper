package com.aiepaper.repository;

import com.aiepaper.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    List<Article> findByHeadlineContainingIgnoreCaseOrderByIdDesc(String headline);

    List<Article> findByContentContainingIgnoreCaseOrderByIdDesc(String keyword);

    List<Article> findByCategoryIgnoreCaseOrderByIdDesc(String category);

    List<Article> findAllByOrderByIdDesc();

    List<Article> findByNewspaperIdOrderByIdDesc(Long newspaperId);

    List<Article> findByNewspaperIdAndCategoryIgnoreCaseOrderByIdDesc(Long newspaperId, String category);
}
