package com.aiepaper.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ArticleSplitterService {

    public List<String> splitArticles(String text) {
        List<String> articles = new ArrayList<>();
        if (text == null || text.trim().isEmpty()) {
            return articles;
        }

        // Try splitting by double newline (\r?\n\r?\n)
        String[] parts = text.split("(\\r?\\n){2,}");

        for (String part : parts) {
            if (part.trim().length() > 150) {
                articles.add(part.trim());
            }
        }

        // Fallback: If no double-newline chunks found, split by lines or paragraph windows
        if (articles.isEmpty()) {
            String[] lines = text.split("\\r?\\n");
            StringBuilder current = new StringBuilder();
            for (String line : lines) {
                current.append(line).append(" ");
                if (current.length() > 500) {
                    articles.add(current.toString().trim());
                    current = new StringBuilder();
                }
            }
            if (current.length() > 100) {
                articles.add(current.toString().trim());
            }
        }

        return articles;
    }
}
