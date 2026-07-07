package com.cleanmatching.backend.domain.admin.dto;

import com.cleanmatching.backend.domain.company.entity.Company;
import com.cleanmatching.backend.domain.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

public class AdminDto {

    @Getter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Stats {
        private long totalUsers;
        private long totalCustomers;
        private long totalCompanies;
        private long pendingCompanies;
        private long approvedCompanies;
        private long rejectedCompanies;
        private long totalRequests;
    }

    @Getter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CompanyApprovalItem {
        private Long id;
        private String companyName;
        private String ownerName;
        private String email;
        private String phone;
        private String sido;
        private String sigungu;
        private String businessNo;
        private String businessDocUrl;
        private String approvalStatus;
        private String rejectReason;
        private LocalDateTime createdAt;

        public static CompanyApprovalItem from(Company c) {
            return CompanyApprovalItem.builder()
                    .id(c.getId())
                    .companyName(c.getCompanyName())
                    .ownerName(c.getUser().getName())
                    .email(c.getUser().getEmail())
                    .phone(c.getUser().getPhone())
                    .sido(c.getSido())
                    .sigungu(c.getSigungu())
                    .businessNo(c.getBusinessNo())
                    .businessDocUrl(c.getBusinessDocUrl())
                    .approvalStatus(c.getApprovalStatus().name())
                    .rejectReason(c.getRejectReason())
                    .createdAt(c.getCreatedAt())
                    .build();
        }
    }

    @Getter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserItem {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String role;
        private LocalDateTime createdAt;

        public static UserItem from(User u) {
            return UserItem.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .phone(u.getPhone())
                    .role(u.getRole().name())
                    .createdAt(u.getCreatedAt())
                    .build();
        }
    }

    @Getter @NoArgsConstructor @AllArgsConstructor
    public static class RejectRequest {
        private String reason;
    }
}
