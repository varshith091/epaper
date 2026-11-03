package com.aiepaper.repository;

import com.aiepaper.entity.Newspaper;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NewspaperRepository
        extends JpaRepository<Newspaper, Long> {

    List<Newspaper> findAllByOrderByIdDesc();
}
