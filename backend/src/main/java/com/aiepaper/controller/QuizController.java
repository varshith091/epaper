package com.aiepaper.controller;

import com.aiepaper.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class QuizController {

    private final GeminiService geminiService;

    @PostMapping
    public String generateQuiz(
            @RequestBody Map<String, String> body
    ) {

        String article = body.get("article");

        String prompt = """
                Read the article and generate:

                1. Five multiple-choice questions.
                2. Four options for each question.
                3. Correct answer.

                Return in plain text.

                Article:

                %s
                """.formatted(article);

        return geminiService.generateExamNotes(prompt);
    }
}