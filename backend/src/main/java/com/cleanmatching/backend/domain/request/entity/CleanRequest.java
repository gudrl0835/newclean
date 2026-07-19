package com.cleanmatching.backend.domain.request.entity;

import com.cleanmatching.backend.domain.company.entity.Company;
import com.cleanmatching.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "clean_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CleanRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false)
    private ServiceType serviceType;

    @Column(nullable = false, length = 200)
    private String address;

    @Column(name = "address_detail", length = 200)
    private String addressDetail;

    @Column(name = "room_size")
    private Integer roomSize;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(length = 1000)
    private String memo;

    // 견적 정보
    @Column(name = "quotation_price")
    private Integer quotationPrice;

    @Column(name = "quotation_note", length = 500)
    private String quotationNote;

    @Column(name = "quotation_visit_at")
    private LocalDateTime quotationVisitAt;

    // 안전번호 (의뢰 체결 시 발급)
    @Column(name = "safe_number", length = 20)
    private String safeNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ServiceType {
        HOUSE, OFFICE, MOVE_IN, MOVE_OUT, SPECIAL, WINDOW
    }

    public enum Status {
        PENDING,      // 대기중
        QUOTED,       // 견적 받음
        ACCEPTED,     // 수락됨
        IN_PROGRESS,  // 진행중
        COMPLETED,    // 완료
        CANCELLED     // 취소
    }
}
