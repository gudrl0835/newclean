package com.cleanmatching.backend.domain.user.dto;

import com.cleanmatching.backend.domain.user.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class AuthDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerSignupRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 8)
        private String password;
        @NotBlank
        private String name;
        private String phone;
        // 리뷰/채팅에서 실명 대신 보여줄 이름 - 필수
        @NotBlank
        private String nickname;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanySignupRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 8)
        private String password;
        @NotBlank
        private String name;
        private String phone;
        @NotBlank
        private String companyName;
        private String description;
        private String sido;
        private String sigungu;
        private String addressDetail;
        private Double latitude;
        private Double longitude;
        private Integer serviceRadius;
        private Integer basePrice;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateMeRequest {
        @NotBlank
        private String name;
        private String phone;
        // 리뷰/채팅 등에서 실명 대신 노출할 이름. 고객은 필수, 업체는 무시됨 - 이 DTO를 고객/업체가 공유해서
        // 여기선 @NotBlank를 걸지 않고 AuthService.updateMe에서 role 보고 검증한다.
        private String nickname;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank
        private String currentPassword;
        @NotBlank @Size(min = 8)
        private String newPassword;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponse {
        private String accessToken;
        private String refreshToken;
        private Long userId;
        private String email;
        private String name;
        private String role;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String email;
        private String name;
        private String phone;
        private String nickname;
        private String role;

        public static UserInfo from(User user) {
            return UserInfo.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .phone(user.getPhone())
                    .nickname(user.getNickname())
                    .role(user.getRole().name())
                    .build();
        }
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SettingsResponse {
        private Long id;
        private String email;
        private String name;
        private String phone;
        private String role;
        private String sido;
        private String sigungu;
        private String addressDetail;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateSettingsRequest {
        @NotBlank
        private String name;
        private String phone;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank
        private String currentPassword;
        @NotBlank
        private String newPassword;
    }
}
