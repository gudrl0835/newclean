package com.cleanmatching.backend.domain.review.entity;

import com.cleanmatching.backend.domain.company.entity.Company;
import com.cleanmatching.backend.domain.request.entity.CleanRequest;
import com.cleanmatching.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private CleanRequest request;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "score_kindness")
    private Integer scoreKindness;

    @Column(name = "score_punctuality")
    private Integer scorePunctuality;

    @Column(name = "score_quality")
    private Integer scoreQuality;

    @Column(length = 1000)
    private String content;

    @Column(name = "before_image", length = 300)
    private String beforeImage;

    @Column(name = "after_image", length = 300)
    private String afterImage;

    @Column(name = "is_verified")
    @Builder.Default
    private boolean verified = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
