package com.cleanmatching.backend.domain.chat.service;

import com.cleanmatching.backend.domain.chat.dto.ChatDto;
import com.cleanmatching.backend.domain.chat.entity.ChatMessage;
import com.cleanmatching.backend.domain.chat.entity.ChatRoom;
import com.cleanmatching.backend.domain.chat.repository.ChatMessageRepository;
import com.cleanmatching.backend.domain.chat.repository.ChatRoomRepository;
import com.cleanmatching.backend.domain.company.entity.Company;
import com.cleanmatching.backend.domain.company.repository.CompanyRepository;
import com.cleanmatching.backend.domain.user.entity.User;
import com.cleanmatching.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /* 채팅방 생성 또는 조회 (의뢰 수락 시 호출) */
    @Transactional
    public ChatRoom getOrCreateRoom(User customer, Company company) {
        return chatRoomRepository.findByCustomerIdAndCompanyId(customer.getId(), company.getId())
                .orElseGet(() -> chatRoomRepository.save(
                        ChatRoom.builder()
                                .customer(customer)
                                .company(company)
                                .build()
                ));
    }

    /* 업체와의 채팅방 열기 (없으면 생성) - 고객이 견적 확정 전 가격 협상 등을 위해 먼저 문의할 때 사용 */
    @Transactional
    public ChatDto.RoomResponse openRoomAsCustomer(Long customerId, Long companyId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        if (customer.getRole() != User.Role.CUSTOMER)
            throw new IllegalArgumentException("고객만 1:1 문의를 시작할 수 있습니다.");
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("업체를 찾을 수 없습니다."));

        ChatRoom room = getOrCreateRoom(customer, company);
        return ChatDto.RoomResponse.from(room, customerId);
    }

    /* 내 채팅방 목록 */
    public List<ChatDto.RoomResponse> getMyRooms(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<ChatRoom> rooms;
        if (user.getRole() == User.Role.CUSTOMER) {
            rooms = chatRoomRepository.findByCustomerIdOrderByLastMessageAtDesc(userId);
        } else {
            Company company = companyRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("업체 정보를 찾을 수 없습니다."));
            rooms = chatRoomRepository.findByCompanyIdOrderByLastMessageAtDesc(company.getId());
        }

        return rooms.stream()
                .map(r -> ChatDto.RoomResponse.from(r, userId))
                .collect(Collectors.toList());
    }

    /* 메시지 이력 조회 + 읽음 처리 */
    @Transactional
    public List<ChatDto.MessageResponse> getMessages(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        boolean isCustomer = room.getCustomer().getId().equals(userId);
        if (isCustomer) room.setCustomerUnread(0);
        else room.setCompanyUnread(0);

        return chatMessageRepository.findByChatRoomIdOrderByCreatedAtAsc(roomId)
                .stream()
                .map(ChatDto.MessageResponse::from)
                .collect(Collectors.toList());
    }

    /* 메시지 저장 및 WebSocket 전송 */
    @Transactional
    public void saveAndSend(Long roomId, Long senderId, ChatDto.SendMessage dto) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .sender(sender)
                .content(dto.getContent())
                .type(ChatMessage.MessageType.TEXT)
                .build();
        chatMessageRepository.save(message);

        room.setLastMessage(dto.getContent());
        room.setLastMessageAt(LocalDateTime.now());

        boolean senderIsCustomer = room.getCustomer().getId().equals(senderId);
        if (senderIsCustomer) room.setCompanyUnread(room.getCompanyUnread() + 1);
        else room.setCustomerUnread(room.getCustomerUnread() + 1);

        messagingTemplate.convertAndSend("/topic/chat/" + roomId,
                ChatDto.MessageResponse.from(message));
    }
}
