package com.cleanmatching.backend.domain.review.service;

import com.cleanmatching.backend.domain.company.entity.Company;
import com.cleanmatching.backend.domain.company.repository.CompanyRepository;
import com.cleanmatching.backend.domain.request.entity.CleanRequest;
import com.cleanmatching.backend.domain.request.repository.RequestRepository;
import com.cleanmatching.backend.domain.review.dto.ReviewDto;
import com.cleanmatching.backend.domain.review.entity.Review;
import com.cleanmatching.backend.domain.review.repository.ReviewRepository;
import com.cleanmatching.backend.domain.user.entity.User;
import com.cleanmatching.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RequestRepository requestRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long createReview(Long customerId, Long requestId, ReviewDto.CreateRequest dto) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        CleanRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("의뢰를 찾을 수 없습니다."));

        // 본인 의뢰인지 확인
        if (!request.getCustomer().getId().equals(customerId))
            throw new IllegalArgumentException("본인의 의뢰에만 리뷰를 작성할 수 있습니다.");

        // 완료된 의뢰인지 확인
        if (request.getStatus() != CleanRequest.Status.COMPLETED)
            throw new IllegalStateException("완료된 의뢰에만 리뷰를 작성할 수 있습니다.");

        // 이미 리뷰가 있는지 확인
        if (reviewRepository.existsByRequestId(requestId))
            throw new IllegalStateException("이미 리뷰를 작성하셨습니다.");

        Company company = request.getCompany();

        Review review = Review.builder()
                .customer(customer)
                .company(company)
                .request(request)
                .score(dto.getScore())
                .scoreKindness(dto.getScoreKindness())
                .scorePunctuality(dto.getScorePunctuality())
                .scoreQuality(dto.getScoreQuality())
                .content(dto.getContent())
                .verified(true)
                .build();

        Review saved = reviewRepository.save(review);

        // 업체 베이지안 평점 업데이트
        company.updateRating(dto.getScore());
        companyRepository.save(company);

        return saved.getId();
    }
}
