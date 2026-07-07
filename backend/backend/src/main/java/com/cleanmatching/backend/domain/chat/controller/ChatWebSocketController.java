package com.cleanmatching.backend.domain.chat.controller;

import com.cleanmatching.backend.domain.chat.dto.ChatDto;
import com.cleanmatching.backend.domain.chat.service.ChatService;
import com.cleanmatching.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final JwtTokenProvider jwtTokenProvider;

    @MessageMapping("/chat/{roomId}")
    public void sendMessage(
            @DestinationVariable Long roomId,
            @Payload ChatDto.SendMessage dto,
            SimpMessageHeaderAccessor headerAccessor) {

        String token = (String) headerAccessor.getSessionAttributes().get("token");
        if (token == null) return;

        Long senderId = jwtTokenProvider.getUserId(token);
        chatService.saveAndSend(roomId, senderId, dto);
    }
}
