package com.cleanmatching.backend.domain.company.service;

import com.cleanmatching.backend.domain.company.dto.CompanyDto;
import com.cleanmatching.backend.domain.company.entity.Company;
import com.cleanmatching.backend.domain.company.repository.CompanyRepository;
import com.cleanmatching.backend.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final ReviewRepository reviewRepository;

    // 지역 기반 검색 - 승인된 업체만
    public List<CompanyDto.Summary> searchByRegion(String sido, String sigungu, String sort) {
        List<Company> companies;
        if (sigungu != null && !sigungu.isBlank()) {
            companies = companyRepository.findBySidoAndSigunguAndApprovalStatus(sido, sigungu, Company.ApprovalStatus.APPROVED);
        } else {
            companies = companyRepository.findBySidoAndApprovalStatus(sido, Company.ApprovalStatus.APPROVED);
        }
        return sortAndMap(companies, sort);
    }

    // GPS 기반 검색
    public List<CompanyDto.Summary> searchByLocation(double lat, double lng, double radius, String sort) {
        List<Company> companies = companyRepository.findNearbyCompanies(lat, lng, radius);
        return sortAndMap(companies, sort);
    }

    // 업체 상세 조회 (리뷰 포함)
    public CompanyDto.Detail getCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("업체를 찾을 수 없습니다."));
        List<CompanyDto.ReviewItem> reviews = reviewRepository
                .findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream()
                .map(CompanyDto.ReviewItem::from)
                .collect(Collectors.toList());
        return CompanyDto.Detail.from(company, reviews);
    }

    // 전체 목록 (홈화면 추천) - 승인된 업체만
    public List<CompanyDto.Summary> getTopCompanies() {
        return companyRepository.findByApprovalStatusOrderByCreatedAtDesc(Company.ApprovalStatus.APPROVED)
                .stream()
                .sorted(Comparator.comparingDouble(Company::getBayesianRating).reversed())
                .limit(10)
                .map(CompanyDto.Summary::from)
                .collect(Collectors.toList());
    }

    // 활동 지역 수정 (업체 본인)
    @Transactional
    public void updateRegion(Long userId, CompanyDto.UpdateRegionRequest request) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("업체 정보를 찾을 수 없습니다."));

        company.setSido(request.getSido());
        company.setSigungu(request.getSigungu());
        company.setAddressDetail(request.getAddressDetail());
    }

    private List<CompanyDto.Summary> sortAndMap(List<Company> companies, String sort) {
        Comparator<Company> comparator = switch (sort != null ? sort : "rating") {
            case "review" -> Comparator.comparingInt(Company::getReviewCount).reversed();
            case "price" -> Comparator.comparingInt(c -> (c.getBasePrice() != null ? c.getBasePrice() : Integer.MAX_VALUE));
            default -> Comparator.comparingDouble(Company::getBayesianRating).reversed();
        };

        return companies.stream()
                .sorted(comparator)
                .map(CompanyDto.Summary::from)
                .collect(Collectors.toList());
    }
}
