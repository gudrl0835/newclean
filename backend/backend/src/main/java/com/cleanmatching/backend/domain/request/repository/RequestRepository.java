package com.cleanmatching.backend.domain.request.repository;

import com.cleanmatching.backend.domain.request.entity.CleanRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<CleanRequest, Long> {

    // 고객이 보낸 의뢰 목록 (최신순)
    List<CleanRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    // 업체가 받은 의뢰 목록 (최신순)
    List<CleanRequest> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    // 업체가 받은 특정 상태 의뢰
    List<CleanRequest> findByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, CleanRequest.Status status);

    // 업체 통계용
    long countByCompanyIdAndStatus(Long companyId, CleanRequest.Status status);
}
