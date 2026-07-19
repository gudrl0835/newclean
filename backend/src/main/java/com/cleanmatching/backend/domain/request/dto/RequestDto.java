package com.cleanmatching.backend.domain.request.dto;

import com.cleanmatching.backend.domain.request.entity.CleanRequest;
import lombok.*;

import java.time.format.DateTimeFormatter;

public class RequestDto {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy.MM.dd");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");

    // 서비스 타입 한글 변환
    public static String serviceLabel(CleanRequest.ServiceType t) {
        return switch (t) {
            case HOUSE -> "가정청소";
            case OFFICE -> "사무실청소";
            case MOVE_IN -> "입주청소";
            case MOVE_OUT -> "이사청소";
            case SPECIAL -> "특수청소";
            case WINDOW -> "창문청소";
        };
    }

    /* ── 의뢰 생성 요청 ── */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private Long companyId;
        private String serviceType;   // HOUSE, OFFICE, MOVE_IN, MOVE_OUT, SPECIAL, WINDOW
        private String address;
        private String addressDetail;
        private Integer roomSize;
        private String scheduledDate; // yyyy-MM-dd
        private String scheduledTime; // HH:mm
        private String memo;
    }

    /* ── 견적서 발송 요청 ── */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuotationRequest {
        private Integer totalPrice;
        private String note;
        private String visitDate;   // yyyy-MM-dd
        private String visitTime;   // HH:mm
    }

    /* ── 고객용 의뢰 요약 ── */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerItem {
        private Long id;
        private Long companyId;
        private String companyName;
        private String service;
        private String address;
        private String scheduledDate;
        private String status;
        private Integer quotationPrice;
        private String safeNumber;
        private boolean hasReview;

        public static CustomerItem from(CleanRequest r, boolean hasReview) {
            return CustomerItem.builder()
                    .id(r.getId())
                    .companyId(r.getCompany() != null ? r.getCompany().getId() : null)
                    .companyName(r.getCompany() != null ? r.getCompany().getCompanyName() : "업체 미배정")
                    .service(serviceLabel(r.getServiceType()))
                    .address(r.getAddress())
                    .scheduledDate(r.getScheduledAt() != null ? r.getScheduledAt().format(DATE_FMT) : "")
                    .status(r.getStatus().name())
                    .quotationPrice(r.getQuotationPrice())
                    .safeNumber(r.getSafeNumber())
                    .hasReview(hasReview)
                    .build();
        }
    }

    /* ── 업체용 의뢰 요약 ── */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyItem {
        private Long id;
        private String customerName;
        private String service;
        private String address;
        private String addressDetail;
        private Integer roomSize;
        private String scheduledDate;
        private String memo;
        private String status;
        private Integer quotationPrice;

        public static CompanyItem from(CleanRequest r) {
            String name = r.getCustomer().getName();
            String masked = name.length() >= 2
                    ? name.charAt(0) + "*".repeat(name.length() - 2) + name.charAt(name.length() - 1)
                    : name;
            return CompanyItem.builder()
                    .id(r.getId())
                    .customerName(masked)
                    .service(serviceLabel(r.getServiceType()))
                    .address(r.getAddress())
                    .addressDetail(r.getAddressDetail())
                    .roomSize(r.getRoomSize())
                    .scheduledDate(r.getScheduledAt() != null ? r.getScheduledAt().format(DATETIME_FMT) : "")
                    .memo(r.getMemo())
                    .status(r.getStatus().name())
                    .quotationPrice(r.getQuotationPrice())
                    .build();
        }
    }

    /* ── 업체 통계 ── */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyStats {
        private long newRequests;
        private long inProgress;
        private long completedThisMonth;
    }
}
