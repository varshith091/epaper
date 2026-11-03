package com.aiepaper.controller;

import com.aiepaper.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/translate")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TranslationController {

    private final GeminiService geminiService;

    @PostMapping
    public String translate(
            @RequestBody Map<String, String> body
    ) {

        String text = body.get("text");
        String language = body.get("language");

        return geminiService.translate(
                text,
                language
        );
    }
}