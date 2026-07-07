package com.cleanmatching.backend.domain.review.controller;

import com.cleanmatching.backend.domain.review.dto.ReviewDto;
import com.cleanmatching.backend.domain.review.service.ReviewService;
import com.cleanmatching.backend.domain.user.entity.User;
import com.cleanmatching.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    // 리뷰 작성 (고객, 완료된 의뢰 기준)
    @PostMapping("/request/{requestId}")
    public ResponseEntity<Map<String, Long>> createReview(
            @PathVariable Long requestId,
            @RequestBody ReviewDto.CreateRequest dto,
            Authentication auth) {
        Long userId = getUserId(auth);
        Long reviewId = reviewService.createReview(userId, requestId, dto);
        return ResponseEntity.ok(Map.of("reviewId", reviewId));
    }

    private Long getUserId(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return user.getId();
    }
}
