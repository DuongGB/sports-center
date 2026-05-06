package com.devduong.be.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

@Service
@Slf4j
public class GeminiService {

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    @Value("${gemini.api-url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Gửi prompt đến Gemini API và nhận phản hồi text.
     * 
     * @param systemPrompt - System instruction (vai trò, ngữ cảnh)
     * @param userMessage  - Câu hỏi của người dùng
     * @return Phản hồi text từ Gemini
     */
    public String generateContent(String systemPrompt, String userMessage) {
        try {
            String url = apiUrl + "/models/" + model + ":generateContent?key=" + apiKey;

            // Build request body theo Gemini API format
            Map<String, Object> requestBody = new LinkedHashMap<>();

            // System instruction
            if (systemPrompt != null && !systemPrompt.isEmpty()) {
                Map<String, Object> systemInstruction = new LinkedHashMap<>();
                Map<String, String> systemPart = new LinkedHashMap<>();
                systemPart.put("text", systemPrompt);
                systemInstruction.put("parts", List.of(systemPart));
                requestBody.put("systemInstruction", systemInstruction);
            }

            // User message
            Map<String, Object> userContent = new LinkedHashMap<>();
            userContent.put("role", "user");
            Map<String, String> userPart = new LinkedHashMap<>();
            userPart.put("text", userMessage);
            userContent.put("parts", List.of(userPart));
            requestBody.put("contents", List.of(userContent));

            // Generation config
            Map<String, Object> generationConfig = new LinkedHashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("topP", 0.95);
            generationConfig.put("topK", 40);
            generationConfig.put("maxOutputTokens", 1024);
            requestBody.put("generationConfig", generationConfig);

            // Safety settings - cho phép tất cả
            List<Map<String, String>> safetySettings = List.of(
                Map.of("category", "HARM_CATEGORY_HARASSMENT", "threshold", "BLOCK_NONE"),
                Map.of("category", "HARM_CATEGORY_HATE_SPEECH", "threshold", "BLOCK_NONE"),
                Map.of("category", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold", "BLOCK_NONE"),
                Map.of("category", "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold", "BLOCK_NONE")
            );
            requestBody.put("safetySettings", safetySettings);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return extractTextFromResponse(response.getBody());
            }

            log.error("Gemini API returned non-2xx: {}", response.getStatusCode());
            return null;

        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage(), e);
            return null;
        }
    }

    private String extractTextFromResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
        }
        return null;
    }
}
