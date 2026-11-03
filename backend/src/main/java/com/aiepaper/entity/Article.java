package com.aiepaper.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "articles")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String headline;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Integer pageNumber;
    private String category;
    
    @ManyToOne
    @JoinColumn(name = "newspaper_id")
    private Newspaper newspaper;

    
}