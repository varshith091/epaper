package com.aiepaper.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class NewspaperRequest {

    private String title;

    private String publisher;

    private String edition;

    private String category;

    private LocalDate publishedDate;
}