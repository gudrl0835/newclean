package com.cleanmatching.backend.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 20)
    private String phone;

    // 리뷰/채팅 등 상대방에게 노출될 때 쓰는 이름. 없으면 실명을 마스킹해서 대신 보여준다.
    @Column(length = 30)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "email_verified")
    @Builder.Default
    private boolean emailVerified = false;

    @Column(name = "refresh_token", length = 500)
    private String refreshToken;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Role {
        CUSTOMER, COMPANY, ADMIN
    }

    // 리뷰/채팅 상대방에게 보여줄 이름. 고객만 익명화 대상 - 업체는 사업자 정보라 실명 그대로 노출.
    public String getDisplayName() {
        if (role != Role.CUSTOMER) return name;
        if (nickname != null && !nickname.isBlank()) return nickname;
        if (name == null) return "익명";
        return name.length() >= 2
                ? name.charAt(0) + "*".repeat(name.length() - 2) + name.charAt(name.length() - 1)
                : name;
    }
}
