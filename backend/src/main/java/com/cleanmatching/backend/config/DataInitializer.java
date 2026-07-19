package com.cleanmatching.backend.config;

import com.cleanmatching.backend.domain.company.entity.Company;
import com.cleanmatching.backend.domain.company.repository.CompanyRepository;
import com.cleanmatching.backend.domain.user.entity.User;
import com.cleanmatching.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

// 이메일은 users 테이블에서 UNIQUE라 existsByEmail 체크로 중복 생성은 막힌다.
// 단, 나중에 app/ 쪽 코드가 자체 시드 데이터를 가져올 때 같은 이메일을 다른 내용으로 쓰면
// 여기서 먼저 만든 계정이 그대로 남고 app 쪽 데이터는 조용히 무시되니, 병합 전에 이메일 목록을 대조할 것.
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        createAdmin();
        createTestCustomer();
        createTestCompanies();
    }

    // 관리자 계정
    private void createAdmin() {
        if (userRepository.existsByEmail("admin@cleanmatching.com")) return;

        User admin = User.builder()
                .email("admin@cleanmatching.com")
                .password(passwordEncoder.encode("admin1234!"))
                .name("관리자")
                .phone("010-0000-0000")
                .role(User.Role.ADMIN)
                .emailVerified(true)
                .build();
        userRepository.save(admin);
        log.info("✅ 관리자 계정 생성: admin@cleanmatching.com / admin1234!");
    }

    // 테스트 고객 계정 3개
    private void createTestCustomer() {
        List<CustomerData> customers = List.of(
            new CustomerData("customer1@test.com", "홍길동", "010-9999-8888"),
            new CustomerData("customer2@test.com", "김철수", "010-8888-7777"),
            new CustomerData("customer3@test.com", "이영희", "010-7777-6666")
        );

        for (CustomerData data : customers) {
            if (userRepository.existsByEmail(data.email)) continue;

            User customer = User.builder()
                    .email(data.email)
                    .password(passwordEncoder.encode("Test1234!"))
                    .name(data.name)
                    .phone(data.phone)
                    .role(User.Role.CUSTOMER)
                    .emailVerified(true)
                    .build();
            userRepository.save(customer);
            log.info("✅ 테스트 고객 생성: {} / Test1234!", data.email);
        }
    }

    // 테스트 업체 계정 5개
    private void createTestCompanies() {
        List<CompanyData> companies = List.of(
            new CompanyData("clean1@test.com", "김청결", "깨끗한청소㈜",
                "010-1111-2222", "서울", "강남구",
                "10년 경력의 전문 청소팀이 직접 방문합니다. 친환경 세제만 사용하며, 청소 전후 사진을 필수로 제공합니다.",
                50000, 37.4979, 127.0276, "123-45-67890"),

            new CompanyData("clean2@test.com", "이믿음", "믿음청소서비스",
                "010-2222-3333", "서울", "서초구",
                "약속 시간을 칼같이 지키는 믿음청소입니다. 이사청소 전문으로 꼼꼼한 청소를 보장합니다.",
                40000, 37.4837, 127.0324, "234-56-78901"),

            new CompanyData("clean3@test.com", "박반짝", "반짝반짝클리닝",
                "010-3333-4444", "경기", "성남시",
                "특수 청소 전문 업체입니다. 에어컨, 욕실 등 일반 청소가 어려운 곳도 반짝반짝하게 만들어드립니다.",
                30000, 37.4449, 127.1388, "345-67-89012"),

            new CompanyData("clean4@test.com", "최스마트", "스마트클린",
                "010-4444-5555", "서울", "송파구",
                "스마트한 청소 시스템으로 효율적이고 깨끗한 청소를 제공합니다. 입주/이사청소 전문입니다.",
                45000, 37.5145, 127.1059, "456-78-90123"),

            new CompanyData("clean5@test.com", "정홈케어", "홈케어청소",
                "010-5555-6666", "인천", "부평구",
                "인천 지역 최고의 가정청소 전문 업체입니다. 에어컨 청소 서비스도 함께 제공합니다.",
                25000, 37.5078, 126.7218, "567-89-01234"),

            new CompanyData("clean6@test.com", "강거절", "거절된청소",
                "010-6666-7777", "서울", "마포구",
                "사업자등록증 확인이 되지 않아 거절된 테스트 업체입니다.",
                35000, 37.5663, 126.9019, "000-00-00000")
        );

        for (CompanyData data : companies) {
            if (userRepository.existsByEmail(data.email)) continue;

            User user = User.builder()
                    .email(data.email)
                    .password(passwordEncoder.encode("Clean1234!"))
                    .name(data.ownerName)
                    .phone(data.phone)
                    .role(User.Role.COMPANY)
                    .emailVerified(true)
                    .build();
            userRepository.save(user);

            // clean1~3은 APPROVED (홈/검색 테스트용), clean4~5는 PENDING, clean6은 REJECTED
            boolean isFirst = data.email.equals("clean1@test.com") || data.email.equals("clean2@test.com") || data.email.equals("clean3@test.com");
            boolean isRejected = data.email.equals("clean6@test.com");
            Company.ApprovalStatus approvalStatus = isRejected
                    ? Company.ApprovalStatus.REJECTED
                    : (isFirst ? Company.ApprovalStatus.APPROVED : Company.ApprovalStatus.PENDING);

            Company company = Company.builder()
                    .user(user)
                    .companyName(data.companyName)
                    .description(data.description)
                    .sido(data.sido)
                    .sigungu(data.sigungu)
                    .latitude(BigDecimal.valueOf(data.lat))
                    .longitude(BigDecimal.valueOf(data.lng))
                    .basePrice(data.basePrice)
                    .serviceRadius(15)
                    .businessNo(data.businessNo)
                    .approvalStatus(approvalStatus)
                    .rejectReason(isRejected ? "사업자등록증 확인 불가" : null)
                    .verified(isFirst)
                    .ratingSum(0.0)
                    .reviewCount(0)
                    .bayesianRating(isFirst ? 4.5 : 0.0)
                    .responseRate(100.0)
                    .completionRate(100.0)
                    .build();
            companyRepository.save(company);

            log.info("✅ 테스트 업체 생성: {} / {}", data.email, data.companyName);
        }
    }

    record CompanyData(
        String email, String ownerName, String companyName,
        String phone, String sido, String sigungu,
        String description, int basePrice,
        double lat, double lng, String businessNo
    ) {}

    record CustomerData(String email, String name, String phone) {}
}
