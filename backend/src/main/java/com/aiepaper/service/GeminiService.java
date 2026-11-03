package com.aiepaper.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    public String translate(
            String text,
            String language
    ) {

        try {

            String shortText =
                    text.length() > 3000
                            ? text.substring(0, 3000)
                            : text;

            Client client = Client.builder()
                    .apiKey(apiKey)
                    .build();

            String prompt = """
                    Translate the following article into %s.

                    Return only the translated text.

                    %s
                    """.formatted(
                    language,
                    shortText
            );

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-3.1-flash-lite",
                            prompt,
                            null
                    );

            return response.text();

        } catch (Exception e) {

            e.printStackTrace();

            return e.getMessage();
        }
    }

    public String askQuestion(
            String article,
            String question
    ) {

        try {

            String shortArticle =
                    article.length() > 3000
                            ? article.substring(0, 3000)
                            : article;

            Client client = Client.builder()
                    .apiKey(apiKey)
                    .build();

           String prompt = """
        Read the article below and answer the question.

        Return the answer in plain text only.

        Do not use markdown symbols like *, **, #, or bullet formatting.

        Article:

        %s

        Question:

        %s
        """.formatted(
        shortArticle,
        question
);

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-3.1-flash-lite",
                            prompt,
                            null
                    );

            return response.text();

        } catch (Exception e) {

            e.printStackTrace();

            return "AI is busy. Try again later.";
        }
    }

    public String generateExamNotes(
            String prompt
    ) {

        try {

            Client client = Client.builder()
                    .apiKey(apiKey)
                    .build();

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-3.1-flash-lite",
                            prompt,
                            null
                    );

            return response.text();

        } catch (Exception e) {

            e.printStackTrace();

            return "Unable to generate exam notes.";
        }
    }

    public String summarize(String text) {
        return summarize(text, "English");
    }

    public String summarize(String text, String language) {
        try {
            String shortText = text.length() > 3000 ? text.substring(0, 3000) : text;
            Client client = Client.builder()
                    .apiKey(apiKey)
                    .build();

            String targetLang = (language != null && !language.trim().isEmpty()) ? language : "English";

            String prompt = """
                    Summarize the following news article into 3 to 4 clear, impactful bullet points in %s.
                    Highlight key facts, key decisions, figures, and what it means for the public.
                    Keep it informative, concise, and clean without introductory greeting.

                    Article:
                    %s
                    """.formatted(targetLang, shortText);

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-3.1-flash-lite",
                            prompt,
                            null
                    );

            return response.text();
        } catch (Exception e) {
            e.printStackTrace();
            return "Unable to generate summary at this moment.";
        }
    }

    public String extractArticlesFromImage(byte[] imageBytes) {
        try {
            Client client = Client.builder()
                    .apiKey(apiKey)
                    .build();

            String prompt = """
                    You are an expert newspaper OCR and digitization system.
                    Analyze the provided newspaper page image carefully.
                    Extract 4 to 8 distinct news articles from this page.
                    For each article:
                    - headline: A clear, compelling title of the article.
                    - content: The complete readable body text of this story (at least 2-4 full sentences).
                    - category: One of: "General", "Politics", "Business", "Sports".

                    Format the output strictly as a JSON array of objects:
                    [
                      {
                        "headline": "Headline here",
                        "content": "Article text here...",
                        "category": "General"
                      }
                    ]
                    Do not include Markdown code blocks or fences like ```json. Return pure JSON text.
                    """;

            com.google.genai.types.Content content = com.google.genai.types.Content.fromParts(
                    com.google.genai.types.Part.fromText(prompt),
                    com.google.genai.types.Part.fromBytes(imageBytes, "image/jpeg")
            );

            String[] models = {"gemini-3.8-flash", "gemini-3.1-flash-lite"};
            for (String model : models) {
                try {
                    GenerateContentResponse response = client.models.generateContent(
                            model,
                            content,
                            null
                    );
                    if (response != null && response.text() != null && !response.text().trim().isEmpty()) {
                        return response.text();
                    }
                } catch (Exception ex) {
                    System.err.println("Gemini vision attempt with " + model + " failed: " + ex.getMessage());
                }
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
