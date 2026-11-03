package com.aiepaper.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "newspapers")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Newspaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String publisher;

    private String edition;

    private String category;

    private String fileName;

    private String filePath;

    private LocalDate publishedDate;

    private LocalDateTime uploadedAt;
}