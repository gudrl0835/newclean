package com.cleanmatching.backend.domain.company.dto;

import com.cleanmatching.backend.domain.company.entity.Company;
import com.cleanmatching.backend.domain.review.entity.Review;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

public class CompanyDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRegionRequest {
        @NotBlank
        private String sido;
        @NotBlank
        private String sigungu;
        private String addressDetail;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewItem {
        private Long id;
        private String customerName;
        private Integer score;
        private String content;
        private String beforeImage;
        private String afterImage;
        private String date;

        public static ReviewItem from(Review r) {
            String name = r.getCustomer().getName();
            // 이름 마스킹: 홍길동 → 홍*동
            String masked = name.length() >= 2
                    ? name.charAt(0) + "*".repeat(name.length() - 2) + name.charAt(name.length() - 1)
                    : name;
            return ReviewItem.builder()
                    .id(r.getId())
                    .customerName(masked)
                    .score(r.getScore())
                    .content(r.getContent())
                    .beforeImage(r.getBeforeImage())
                    .afterImage(r.getAfterImage())
                    .date(r.getCreatedAt() != null
                            ? r.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy.MM.dd"))
                            : "")
                    .build();
        }
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String companyName;
        private String description;
        private String sido;
        private String sigungu;
        private Double bayesianRating;
        private Integer reviewCount;
        private Integer basePrice;
        private String profileImage;
        private Double responseRate;
        private boolean verified;

        public static Summary from(Company c) {
            return Summary.builder()
                    .id(c.getId())
                    .companyName(c.getCompanyName())
                    .description(c.getDescription())
                    .sido(c.getSido())
                    .sigungu(c.getSigungu())
                    .bayesianRating(Math.round(c.getBayesianRating() * 10.0) / 10.0)
                    .reviewCount(c.getReviewCount())
                    .basePrice(c.getBasePrice())
                    .profileImage(c.getProfileImage())
                    .responseRate(c.getResponseRate())
                    .verified(c.isVerified())
                    .build();
        }
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Detail {
        private Long id;
        private String companyName;
        private String description;
        private String sido;
        private String sigungu;
        private String addressDetail;
        private Double bayesianRating;
        private Integer reviewCount;
        private Integer basePrice;
        private String profileImage;
        private Double responseRate;
        private Double completionRate;
        private Integer serviceRadius;
        private boolean verified;
        private List<ReviewItem> reviews;

        public static Detail from(Company c) {
            return Detail.builder()
                    .id(c.getId())
                    .companyName(c.getCompanyName())
                    .description(c.getDescription())
                    .sido(c.getSido())
                    .sigungu(c.getSigungu())
                    .addressDetail(c.getAddressDetail())
                    .bayesianRating(Math.round(c.getBayesianRating() * 10.0) / 10.0)
                    .reviewCount(c.getReviewCount())
                    .basePrice(c.getBasePrice())
                    .profileImage(c.getProfileImage())
                    .responseRate(c.getResponseRate())
                    .completionRate(c.getCompletionRate())
                    .serviceRadius(c.getServiceRadius())
                    .verified(c.isVerified())
                    .reviews(List.of())
                    .build();
        }

        public static Detail from(Company c, List<ReviewItem> reviews) {
            return Detail.builder()
                    .id(c.getId())
                    .companyName(c.getCompanyName())
                    .description(c.getDescription())
                    .sido(c.getSido())
                    .sigungu(c.getSigungu())
                    .addressDetail(c.getAddressDetail())
                    .bayesianRating(Math.round(c.getBayesianRating() * 10.0) / 10.0)
                    .reviewCount(c.getReviewCount())
                    .basePrice(c.getBasePrice())
                    .profileImage(c.getProfileImage())
                    .responseRate(c.getResponseRate())
                    .completionRate(c.getCompletionRate())
                    .serviceRadius(c.getServiceRadius())
                    .verified(c.isVerified())
                    .reviews(reviews)
                    .build();
        }
    }
}
