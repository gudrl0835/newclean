package com.cleanmatching.backend.domain.company.controller;

import com.cleanmatching.backend.domain.company.dto.CompanyDto;
import com.cleanmatching.backend.domain.company.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    // 내 업체 프로필 조회 (수정 화면용)
    @GetMapping("/me")
    public ResponseEntity<CompanyDto.MyProfile> getMyProfile(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(companyService.getMyProfile(userId));
    }

    // 내 업체 프로필 수정
    @PutMapping("/me")
    public ResponseEntity<CompanyDto.MyProfile> updateProfile(
            Authentication authentication,
            @RequestBody CompanyDto.UpdateProfileRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(companyService.updateProfile(userId, request));
    }

    // 홈화면 추천 업체
    @GetMapping
    public ResponseEntity<List<CompanyDto.Summary>> getTopCompanies() {
        return ResponseEntity.ok(companyService.getTopCompanies());
    }

    // 지역 기반 검색
    @GetMapping("/search")
    public ResponseEntity<List<CompanyDto.Summary>> searchByRegion(
            @RequestParam String sido,
            @RequestParam(required = false) String sigungu,
            @RequestParam(defaultValue = "rating") String sort) {
        return ResponseEntity.ok(companyService.searchByRegion(sido, sigungu, sort));
    }

    // GPS 기반 검색
    @GetMapping("/nearby")
    public ResponseEntity<List<CompanyDto.Summary>> searchNearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radius,
            @RequestParam(defaultValue = "rating") String sort) {
        return ResponseEntity.ok(companyService.searchByLocation(lat, lng, radius, sort));
    }

    // 업체 상세
    @GetMapping("/{id}")
    public ResponseEntity<CompanyDto.Detail> getCompany(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompany(id));
    }
}
