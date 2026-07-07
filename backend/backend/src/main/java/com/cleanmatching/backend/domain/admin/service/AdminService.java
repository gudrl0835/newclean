package com.cleanmatching.backend.domain.admin.service;

import com.cleanmatching.backend.domain.admin.dto.AdminDto;
import com.cleanmatching.backend.domain.company.entity.Company;
import com.cleanmatching.backend.domain.company.repository.CompanyRepository;
import com.cleanmatching.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    // 전체 통계
    public AdminDto.Stats getStats() {
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(com.cleanmatching.backend.domain.user.entity.User.Role.CUSTOMER);
        long totalCompanies = userRepository.countByRole(com.cleanmatching.backend.domain.user.entity.User.Role.COMPANY);
        long pendingCompanies = companyRepository.countByApprovalStatus(Company.ApprovalStatus.PENDING);
        long approvedCompanies = companyRepository.countByApprovalStatus(Company.ApprovalStatus.APPROVED);
        long rejectedCompanies = companyRepository.countByApprovalStatus(Company.ApprovalStatus.REJECTED);

        return AdminDto.Stats.builder()
                .totalUsers(totalUsers)
                .totalCustomers(totalCustomers)
                .totalCompanies(totalCompanies)
                .pendingCompanies(pendingCompanies)
                .approvedCompanies(approvedCompanies)
                .rejectedCompanies(rejectedCompanies)
                .totalRequests(0L)
                .build();
    }

    // 업체 목록 (상태별 필터)
    public List<AdminDto.CompanyApprovalItem> getCompanies(String status) {
        List<Company> companies;
        if (status != null && !status.equals("ALL")) {
            Company.ApprovalStatus approvalStatus = Company.ApprovalStatus.valueOf(status);
            companies = companyRepository.findByApprovalStatusOrderByCreatedAtDesc(approvalStatus);
        } else {
            companies = companyRepository.findAllByOrderByCreatedAtDesc();
        }
        return companies.stream()
                .map(AdminDto.CompanyApprovalItem::from)
                .collect(Collectors.toList());
    }

    // 업체 승인
    @Transactional
    public void approveCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("업체를 찾을 수 없습니다."));
        company.setApprovalStatus(Company.ApprovalStatus.APPROVED);
        company.setVerified(true);
        company.setRejectReason(null);
    }

    // 업체 거절
    @Transactional
    public void rejectCompany(Long companyId, String reason) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("업체를 찾을 수 없습니다."));
        company.setApprovalStatus(Company.ApprovalStatus.REJECTED);
        company.setVerified(false);
        company.setRejectReason(reason);
    }

    // 회원 목록
    public List<AdminDto.UserItem> getUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AdminDto.UserItem::from)
                .collect(Collectors.toList());
    }

    // 회원 삭제
    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }
}
