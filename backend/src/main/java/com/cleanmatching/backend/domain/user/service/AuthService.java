package com.cleanmatching.backend.domain.user.service;

import com.cleanmatching.backend.domain.company.entity.Company;
import com.cleanmatching.backend.domain.company.repository.CompanyRepository;
import com.cleanmatching.backend.domain.user.dto.AuthDto;
import com.cleanmatching.backend.domain.user.entity.User;
import com.cleanmatching.backend.domain.user.repository.UserRepository;
import com.cleanmatching.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public void signupCustomer(AuthDto.CustomerSignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .nickname(request.getNickname())
                .role(User.Role.CUSTOMER)
                .build();

        userRepository.save(user);
    }

    public void signupCompany(AuthDto.CompanySignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .role(User.Role.COMPANY)
                .build();

        userRepository.save(user);

        Company company = Company.builder()
                .user(user)
                .companyName(request.getCompanyName())
                .description(request.getDescription())
                .sido(request.getSido())
                .sigungu(request.getSigungu())
                .addressDetail(request.getAddressDetail())
                .latitude(request.getLatitude() != null ? BigDecimal.valueOf(request.getLatitude()) : null)
                .longitude(request.getLongitude() != null ? BigDecimal.valueOf(request.getLongitude()) : null)
                .serviceRadius(request.getServiceRadius() != null ? request.getServiceRadius() : 10)
                .basePrice(request.getBasePrice())
                .build();

        companyRepository.save(company);
    }

    public AuthDto.LoginResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 틀렸습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 틀렸습니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        user.setRefreshToken(refreshToken);

        return AuthDto.LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthDto.UserInfo getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return AuthDto.UserInfo.from(user);
    }

    // 내 정보 수정 (이름/전화번호) - 고객/업체 공통
    public AuthDto.UserInfo updateMe(Long userId, AuthDto.UpdateMeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        // 닉네임은 고객만 필수 (리뷰/채팅에서 실명 대신 노출) - 업체에겐 의미가 없어 검증하지 않는다.
        if (user.getRole() == User.Role.CUSTOMER
                && (request.getNickname() == null || request.getNickname().isBlank())) {
            throw new IllegalArgumentException("닉네임을 입력해주세요.");
        }
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setNickname(request.getNickname());
        return AuthDto.UserInfo.from(user);
    }

    // 비밀번호 변경
    public void changePassword(Long userId, AuthDto.ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }

    @Transactional(readOnly = true)
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }
}
