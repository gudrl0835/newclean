package com.cleanmatching.backend.domain.support.controller;

import com.cleanmatching.backend.domain.support.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> ask(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("answer", "메시지를 입력해주세요."));
        }
        String answer = chatbotService.getAnswer(message);
        return ResponseEntity.ok(Map.of("answer", answer));
    }
}
