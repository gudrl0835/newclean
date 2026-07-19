package com.cleanmatching.backend.domain.company.repository;

import com.cleanmatching.backend.domain.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByUserId(Long userId);

    List<Company> findBySidoAndSigungu(String sido, String sigungu);
    List<Company> findBySido(String sido);
    List<Company> findBySidoAndSigunguAndApprovalStatus(String sido, String sigungu, Company.ApprovalStatus status);
    List<Company> findBySidoAndApprovalStatus(String sido, Company.ApprovalStatus status);

    List<Company> findByApprovalStatusOrderByCreatedAtDesc(Company.ApprovalStatus status);

    List<Company> findAllByOrderByCreatedAtDesc();

    long countByApprovalStatus(Company.ApprovalStatus status);

    // 거리 기반 검색 (Haversine 공식)
    @Query(value = """
        SELECT c.*,
               (6371 * acos(cos(radians(:lat)) * cos(radians(c.latitude))
               * cos(radians(c.longitude) - radians(:lng))
               + sin(radians(:lat)) * sin(radians(c.latitude)))) AS distance
        FROM companies c
        WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL
        HAVING distance <= :radius
        ORDER BY c.bayesian_rating DESC
        LIMIT 50
        """, nativeQuery = true)
    List<Company> findNearbyCompanies(
            @Param("lat") double latitude,
            @Param("lng") double longitude,
            @Param("radius") double radiusKm
    );
}
