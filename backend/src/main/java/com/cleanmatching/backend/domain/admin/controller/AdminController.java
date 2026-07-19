package com.cleanmatching.backend.domain.admin.controller;

import com.cleanmatching.backend.domain.admin.dto.AdminDto;
import com.cleanmatching.backend.domain.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // 통계
    @GetMapping("/stats")
    public ResponseEntity<AdminDto.Stats> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    // 업체 목록 (status: ALL, PENDING, APPROVED, REJECTED)
    @GetMapping("/companies")
    public ResponseEntity<List<AdminDto.CompanyApprovalItem>> getCompanies(
            @RequestParam(defaultValue = "ALL") String status) {
        return ResponseEntity.ok(adminService.getCompanies(status));
    }

    // 업체 승인
    @PatchMapping("/companies/{id}/approve")
    public ResponseEntity<String> approveCompany(@PathVariable Long id) {
        adminService.approveCompany(id);
        return ResponseEntity.ok("업체가 승인되었습니다.");
    }

    // 업체 거절
    @PatchMapping("/companies/{id}/reject")
    public ResponseEntity<String> rejectCompany(
            @PathVariable Long id,
            @RequestBody AdminDto.RejectRequest request) {
        adminService.rejectCompany(id, request.getReason());
        return ResponseEntity.ok("업체가 거절되었습니다.");
    }

    // 회원 목록
    @GetMapping("/users")
    public ResponseEntity<List<AdminDto.UserItem>> getUsers() {
        return ResponseEntity.ok(adminService.getUsers());
    }

    // 회원 삭제
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok("회원이 삭제되었습니다.");
    }
}
