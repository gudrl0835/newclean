package com.cleanmatching.backend.domain.chat.dto;

import com.cleanmatching.backend.domain.chat.entity.ChatMessage;
import com.cleanmatching.backend.domain.chat.entity.ChatRoom;
import lombok.*;

import java.time.LocalDateTime;

public class ChatDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendMessage {
        private String content;
    }

    @Getter
    @Builder
    public static class MessageResponse {
        private Long id;
        private Long roomId;
        private Long senderId;
        private String senderName;
        private String content;
        private String type;
        private boolean read;
        private LocalDateTime createdAt;

        public static MessageResponse from(ChatMessage msg) {
            return MessageResponse.builder()
                    .id(msg.getId())
                    .roomId(msg.getChatRoom().getId())
                    .senderId(msg.getSender().getId())
                    .senderName(msg.getSender().getName())
                    .content(msg.getContent())
                    .type(msg.getType().name())
                    .read(msg.isRead())
                    .createdAt(msg.getCreatedAt())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class RoomResponse {
        private Long id;
        private Long companyId;
        private String companyName;
        private Long customerId;
        private String customerName;
        private String lastMessage;
        private LocalDateTime lastMessageAt;
        private int unreadCount;

        public static RoomResponse from(ChatRoom room, Long myUserId) {
            boolean isCustomer = room.getCustomer().getId().equals(myUserId);
            int unread = isCustomer ? room.getCustomerUnread() : room.getCompanyUnread();
            return RoomResponse.builder()
                    .id(room.getId())
                    .companyId(room.getCompany().getId())
                    .companyName(room.getCompany().getCompanyName())
                    .customerId(room.getCustomer().getId())
                    .customerName(room.getCustomer().getName())
                    .lastMessage(room.getLastMessage())
                    .lastMessageAt(room.getLastMessageAt())
                    .unreadCount(unread)
                    .build();
        }
    }
}
