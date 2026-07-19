package com.cleanmatching.backend.domain.chat.controller;

import com.cleanmatching.backend.domain.chat.dto.ChatDto;
import com.cleanmatching.backend.domain.chat.service.ChatService;
import com.cleanmatching.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final JwtTokenProvider jwtTokenProvider;

    /* 내 채팅방 목록 */
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatDto.RoomResponse>> getMyRooms(
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(chatService.getMyRooms(userId));
    }

    /* 채팅방 메시지 이력 */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatDto.MessageResponse>> getMessages(
            @PathVariable Long roomId,
            @RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserId(token.replace("Bearer ", ""));
        return ResponseEntity.ok(chatService.getMessages(roomId, userId));
    }
}
