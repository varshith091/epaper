package com.aiepaper.controller;

import com.aiepaper.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/exam")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ExamController {

    private final GeminiService geminiService;

    @PostMapping
    public String exam(
            @RequestBody Map<String, String> body
    ) {

        String article = body.get("article");

        return geminiService.generateExamNotes(article);
    }
}