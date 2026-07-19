package com.cleanmatching.backend.domain.request.service;

import com.cleanmatching.backend.domain.chat.service.ChatService;
import com.cleanmatching.backend.domain.company.entity.Company;
import com.cleanmatching.backend.domain.company.repository.CompanyRepository;
import com.cleanmatching.backend.domain.request.dto.RequestDto;
import com.cleanmatching.backend.domain.request.entity.CleanRequest;
import com.cleanmatching.backend.domain.request.repository.RequestRepository;
import com.cleanmatching.backend.domain.review.repository.ReviewRepository;
import com.cleanmatching.backend.domain.user.entity.User;
import com.cleanmatching.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final ReviewRepository reviewRepository;
    private final ChatService chatService;

    /* ── 의뢰 생성 (고객) ── */
    @Transactional
    public Long createRequest(Long customerId, RequestDto.CreateRequest dto) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("업체를 찾을 수 없습니다."));

        LocalDateTime scheduledAt = null;
        if (dto.getScheduledDate() != null && dto.getScheduledTime() != null) {
            LocalDate date = LocalDate.parse(dto.getScheduledDate());
            String[] parts = dto.getScheduledTime().replace("오전 ", "").replace("오후 ", "").split(":");
            int hour = Integer.parseInt(parts[0]);
            int minute = Integer.parseInt(parts[1]);
            if (dto.getScheduledTime().startsWith("오후") && hour != 12) hour += 12;
            scheduledAt = LocalDateTime.of(date, LocalTime.of(hour, minute));
        }

        CleanRequest request = CleanRequest.builder()
                .customer(customer)
                .company(company)
                .serviceType(CleanRequest.ServiceType.valueOf(dto.getServiceType()))
                .address(dto.getAddress())
                .addressDetail(dto.getAddressDetail())
                .roomSize(dto.getRoomSize())
                .scheduledAt(scheduledAt)
                .memo(dto.getMemo())
                .status(CleanRequest.Status.PENDING)
                .build();

        return requestRepository.save(request).getId();
    }

    /* ── 고객의 의뢰 목록 ── */
    public List<RequestDto.CustomerItem> getMyRequests(Long customerId) {
        return requestRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(r -> {
                    boolean hasReview = reviewRepository.existsByRequestId(r.getId());
                    return RequestDto.CustomerItem.from(r, hasReview);
                })
                .collect(Collectors.toList());
    }

    /* ── 업체가 받은 의뢰 목록 ── */
    public List<RequestDto.CompanyItem> getCompanyRequests(Long userId) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("업체 정보를 찾을 수 없습니다."));
        return requestRepository.findByCompanyIdOrderByCreatedAtDesc(company.getId())
                .stream()
                .map(RequestDto.CompanyItem::from)
                .collect(Collectors.toList());
    }

    /* ── 업체 통계 ── */
    public RequestDto.CompanyStats getCompanyStats(Long userId) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("업체 정보를 찾을 수 없습니다."));
        long newReqs = requestRepository.countByCompanyIdAndStatus(company.getId(), CleanRequest.Status.PENDING);
        long inProg = requestRepository.countByCompanyIdAndStatus(company.getId(), CleanRequest.Status.IN_PROGRESS)
                + requestRepository.countByCompanyIdAndStatus(company.getId(), CleanRequest.Status.ACCEPTED);
        long completed = requestRepository.countByCompanyIdAndStatus(company.getId(), CleanRequest.Status.COMPLETED);
        return RequestDto.CompanyStats.builder()
                .newRequests(newReqs)
                .inProgress(inProg)
                .completedThisMonth(completed)
                .build();
    }

    /* ── 견적서 발송 (업체) ── */
    @Transactional
    public void sendQuotation(Long requestId, Long userId, RequestDto.QuotationRequest dto) {
        CleanRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("의뢰를 찾을 수 없습니다."));
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("업체 정보를 찾을 수 없습니다."));

        if (!request.getCompany().getId().equals(company.getId()))
            throw new IllegalArgumentException("권한이 없습니다.");

        LocalDateTime visitAt = null;
        if (dto.getVisitDate() != null && dto.getVisitTime() != null) {
            LocalDate date = LocalDate.parse(dto.getVisitDate());
            String[] parts = dto.getVisitTime().replace("오전 ", "").replace("오후 ", "").split(":");
            int hour = Integer.parseInt(parts[0]);
            int minute = Integer.parseInt(parts[1]);
            if (dto.getVisitTime().startsWith("오후") && hour != 12) hour += 12;
            visitAt = LocalDateTime.of(date, LocalTime.of(hour, minute));
        }

        request.setQuotationPrice(dto.getTotalPrice());
        request.setQuotationNote(dto.getNote());
        request.setQuotationVisitAt(visitAt);
        request.setStatus(CleanRequest.Status.QUOTED);
    }

    /* ── 견적 수락 (고객) ── */
    @Transactional
    public void acceptQuotation(Long requestId, Long customerId) {
        CleanRequest request = findRequestAsCustomer(requestId, customerId);
        if (request.getStatus() != CleanRequest.Status.QUOTED)
            throw new IllegalStateException("견적이 발송된 의뢰만 수락할 수 있습니다.");

        // 안전번호 생성 (070-XXXX-XXXX)
        int n1 = ThreadLocalRandom.current().nextInt(1000, 9999);
        int n2 = ThreadLocalRandom.current().nextInt(1000, 9999);
        request.setSafeNumber("070-" + n1 + "-" + n2);
        request.setStatus(CleanRequest.Status.ACCEPTED);

        // 채팅방 자동 생성
        User customer = request.getCustomer();
        Company company = request.getCompany();
        chatService.getOrCreateRoom(customer, company);
    }

    /* ── 의뢰 취소 (고객) ── */
    @Transactional
    public void cancelRequest(Long requestId, Long customerId) {
        CleanRequest request = findRequestAsCustomer(requestId, customerId);
        if (request.getStatus() == CleanRequest.Status.COMPLETED)
            throw new IllegalStateException("완료된 의뢰는 취소할 수 없습니다.");
        request.setStatus(CleanRequest.Status.CANCELLED);
    }

    /* ── 의뢰 거절 (업체) ── */
    @Transactional
    public void rejectRequest(Long requestId, Long userId) {
        CleanRequest request = findRequestAsCompany(requestId, userId);
        request.setStatus(CleanRequest.Status.CANCELLED);
    }

    /* ── 완료 처리 (업체) ── */
    @Transactional
    public void completeRequest(Long requestId, Long userId) {
        CleanRequest request = findRequestAsCompany(requestId, userId);
        if (request.getStatus() != CleanRequest.Status.IN_PROGRESS && request.getStatus() != CleanRequest.Status.ACCEPTED)
            throw new IllegalStateException("진행중 또는 수락된 의뢰만 완료 처리할 수 있습니다.");
        request.setStatus(CleanRequest.Status.COMPLETED);
    }

    /* ── 진행중 처리 (업체) ── */
    @Transactional
    public void startRequest(Long requestId, Long userId) {
        CleanRequest request = findRequestAsCompany(requestId, userId);
        if (request.getStatus() != CleanRequest.Status.ACCEPTED)
            throw new IllegalStateException("수락된 의뢰만 진행중으로 변경할 수 있습니다.");
        request.setStatus(CleanRequest.Status.IN_PROGRESS);
    }

    // ─── helpers ───
    private CleanRequest findRequestAsCustomer(Long requestId, Long customerId) {
        CleanRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("의뢰를 찾을 수 없습니다."));
        if (!req.getCustomer().getId().equals(customerId))
            throw new IllegalArgumentException("권한이 없습니다.");
        return req;
    }

    private CleanRequest findRequestAsCompany(Long requestId, Long userId) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("업체 정보를 찾을 수 없습니다."));
        CleanRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("의뢰를 찾을 수 없습니다."));
        if (!req.getCompany().getId().equals(company.getId()))
            throw new IllegalArgumentException("권한이 없습니다.");
        return req;
    }
}
