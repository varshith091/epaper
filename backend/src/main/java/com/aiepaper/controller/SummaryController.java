package com.aiepaper.controller;

import com.aiepaper.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/summary")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class SummaryController {

    private final GeminiService geminiService;

    @PostMapping
    public String summarize(
            @RequestBody Map<String, String> body
    ) {

        String text = body.get("text");
        String language = body.get("language");

        if (text == null || text.trim().isEmpty()) {
            return "No text provided.";
        }

        return geminiService.summarize(text, language);
    }
}
