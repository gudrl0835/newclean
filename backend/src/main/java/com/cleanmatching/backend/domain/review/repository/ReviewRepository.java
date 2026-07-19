package com.cleanmatching.backend.domain.review.repository;

import com.cleanmatching.backend.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    long countByCompanyId(Long companyId);

    boolean existsByRequestId(Long requestId);
}
