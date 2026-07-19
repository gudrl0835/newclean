package com.cleanmatching.backend.domain.chat.repository;

import com.cleanmatching.backend.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    List<ChatRoom> findByCustomerIdOrderByLastMessageAtDesc(Long customerId);
    List<ChatRoom> findByCompanyIdOrderByLastMessageAtDesc(Long companyId);
    Optional<ChatRoom> findByCustomerIdAndCompanyId(Long customerId, Long companyId);
}
