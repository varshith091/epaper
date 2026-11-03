package com.aiepaper.controller;

import com.aiepaper.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ChatController {

    private final GeminiService geminiService;

    @PostMapping
    public String askQuestion(
            @RequestBody Map<String, String> body
    ) {

        return geminiService.askQuestion(
                body.get("article"),
                body.get("question")
        );
    }
}