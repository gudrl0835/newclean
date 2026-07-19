package com.cleanmatching.backend.domain.request.controller;

import com.cleanmatching.backend.domain.request.dto.RequestDto;
import com.cleanmatching.backend.domain.request.service.RequestService;
import com.cleanmatching.backend.domain.user.entity.User;
import com.cleanmatching.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;
    private final UserRepository userRepository;

    /* ── 의뢰 생성 (고객) ── */
    @PostMapping
    public ResponseEntity<Map<String, Long>> create(
            @RequestBody RequestDto.CreateRequest dto,
            Authentication auth) {
        Long userId = getUserId(auth);
        Long requestId = requestService.createRequest(userId, dto);
        return ResponseEntity.ok(Map.of("requestId", requestId));
    }

    /* ── 내 의뢰 목록 (고객) ── */
    @GetMapping("/my")
    public ResponseEntity<List<RequestDto.CustomerItem>> getMyRequests(Authentication auth) {
        return ResponseEntity.ok(requestService.getMyRequests(getUserId(auth)));
    }

    /* ── 업체 받은 의뢰 목록 ── */
    @GetMapping("/company")
    public ResponseEntity<List<RequestDto.CompanyItem>> getCompanyRequests(Authentication auth) {
        return ResponseEntity.ok(requestService.getCompanyRequests(getUserId(auth)));
    }

    /* ── 업체 통계 ── */
    @GetMapping("/company/stats")
    public ResponseEntity<RequestDto.CompanyStats> getCompanyStats(Authentication auth) {
        return ResponseEntity.ok(requestService.getCompanyStats(getUserId(auth)));
    }

    /* ── 견적서 발송 (업체) ── */
    @PostMapping("/{id}/quote")
    public ResponseEntity<Void> sendQuotation(
            @PathVariable Long id,
            @RequestBody RequestDto.QuotationRequest dto,
            Authentication auth) {
        requestService.sendQuotation(id, getUserId(auth), dto);
        return ResponseEntity.ok().build();
    }

    /* ── 견적 수락 (고객) ── */
    @PatchMapping("/{id}/accept")
    public ResponseEntity<Void> accept(@PathVariable Long id, Authentication auth) {
        requestService.acceptQuotation(id, getUserId(auth));
        return ResponseEntity.ok().build();
    }

    /* ── 의뢰 취소 (고객) ── */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication auth) {
        requestService.cancelRequest(id, getUserId(auth));
        return ResponseEntity.ok().build();
    }

    /* ── 의뢰 거절 (업체) ── */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Void> reject(@PathVariable Long id, Authentication auth) {
        requestService.rejectRequest(id, getUserId(auth));
        return ResponseEntity.ok().build();
    }

    /* ── 청소 시작 (업체) ── */
    @PatchMapping("/{id}/start")
    public ResponseEntity<Void> start(@PathVariable Long id, Authentication auth) {
        requestService.startRequest(id, getUserId(auth));
        return ResponseEntity.ok().build();
    }

    /* ── 완료 처리 (업체) ── */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<Void> complete(@PathVariable Long id, Authentication auth) {
        requestService.completeRequest(id, getUserId(auth));
        return ResponseEntity.ok().build();
    }

    private Long getUserId(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return user.getId();
    }
}
