package com.cleanmatching.backend.domain.company.entity;

import com.cleanmatching.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @Column(length = 500)
    private String description;

    @Column(name = "sido", length = 20)
    private String sido;

    @Column(name = "sigungu", length = 30)
    private String sigungu;

    @Column(name = "address_detail", length = 200)
    private String addressDetail;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "service_radius")
    @Builder.Default
    private Integer serviceRadius = 10;

    @Column(name = "base_price")
    private Integer basePrice;

    @Column(name = "profile_image", length = 300)
    private String profileImage;

    // 베이지안 평점 관련
    @Column(name = "rating_sum")
    @Builder.Default
    private Double ratingSum = 0.0;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "bayesian_rating")
    @Builder.Default
    private Double bayesianRating = 0.0;

    @Column(name = "response_rate")
    @Builder.Default
    private Double responseRate = 100.0;

    @Column(name = "completion_rate")
    @Builder.Default
    private Double completionRate = 100.0;

    @Column(name = "business_no", length = 20)
    private String businessNo;

    @Column(name = "business_doc_url", length = 300)
    private String businessDocUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "reject_reason", length = 300)
    private String rejectReason;

    @Column(name = "is_verified")
    @Builder.Default
    private boolean verified = false;

    public enum ApprovalStatus {
        PENDING,   // 심사 대기
        APPROVED,  // 승인
        REJECTED   // 거절
    }

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 베이지안 평점 업데이트 메서드
    public void updateRating(int newScore) {
        this.ratingSum += newScore;
        this.reviewCount += 1;
        // 베이지안 평균: (C * m + Σr) / (C + n)
        double C = 10.0; // 기준 리뷰 수
        double m = 3.0;  // 전체 평균 (기본값)
        this.bayesianRating = (C * m + this.ratingSum) / (C + this.reviewCount);
    }
}
