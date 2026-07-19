package com.cleanmatching.backend.domain.user.controller;

import com.cleanmatching.backend.domain.user.dto.AuthDto;
import com.cleanmatching.backend.domain.user.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 고객 회원가입
    @PostMapping("/signup/customer")
    public ResponseEntity<String> signupCustomer(
            @Valid @RequestBody AuthDto.CustomerSignupRequest request) {
        authService.signupCustomer(request);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    // 업체 회원가입
    @PostMapping("/signup/company")
    public ResponseEntity<String> signupCompany(
            @Valid @RequestBody AuthDto.CompanySignupRequest request) {
        authService.signupCompany(request);
        return ResponseEntity.ok("업체 등록이 완료되었습니다.");
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<AuthDto.LoginResponse> login(
            @Valid @RequestBody AuthDto.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // 내 정보 조회
    @GetMapping("/me")
    public ResponseEntity<AuthDto.UserInfo> getMe(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(authService.getMe(userId));
    }

    // 이메일 중복 확인
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(authService.isEmailAvailable(email));
    }

    // 내 정보 수정 (이름/전화번호)
    @PatchMapping("/me")
    public ResponseEntity<AuthDto.UserInfo> updateMe(
            Authentication authentication,
            @Valid @RequestBody AuthDto.UpdateMeRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(authService.updateMe(userId, request));
    }

    // 비밀번호 변경
    @PatchMapping("/me/password")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @Valid @RequestBody AuthDto.ChangePasswordRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        authService.changePassword(userId, request);
        return ResponseEntity.ok("비밀번호가 변경되었습니다.");
    }
}
