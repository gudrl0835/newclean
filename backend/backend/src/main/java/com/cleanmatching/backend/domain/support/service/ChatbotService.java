package com.cleanmatching.backend.domain.support.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Slf4j
@Service
public class ChatbotService {

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    private static final String SYSTEM_PROMPT = """
            당신은 '클린매칭'의 AI 고객 지원 담당자입니다.
            클린매칭은 청소 서비스 업체와 고객을 연결해주는 플랫폼입니다.

            주요 서비스:
            - 지역별/GPS 기반 청소 업체 검색
            - 업체에 청소 의뢰 요청
            - 실시간 1:1 채팅으로 견적 상담
            - 청소 완료 후 리뷰 작성
            - 안전번호를 통한 개인정보 보호 통화

            답변 규칙:
            1. 친절하고 간결하게 답변하세요 (3~5문장 이내)
            2. 클린매칭 서비스와 관련 없는 질문은 정중히 거절하세요
            3. 개인정보(전화번호, 주소 등)를 요구하거나 수집하지 마세요
            4. 해결하기 어려운 문제는 "담당자에게 연결해드릴까요?"라고 안내하세요
            5. 항상 한국어로 답변하세요
            """;

    // FAQ - API 키 없어도 동작
    private static final Map<String, String> FAQ = new LinkedHashMap<>() {{
        put("의뢰", "업체 상세 페이지에서 '의뢰하기' 버튼을 누르면 서비스 종류, 주소, 날짜를 입력해 의뢰를 보낼 수 있어요. 로그인이 필요합니다!");
        put("견적", "의뢰를 보내면 업체에서 채팅으로 항목별 견적서를 보내드려요. 견적을 확인하고 수락/거절할 수 있어요.");
        put("취소", "의뢰 취소는 '내 의뢰' 페이지에서 가능해요. 단, 청소 시작 후에는 취소가 어려울 수 있어요.");
        put("안전번호", "의뢰가 체결되면 실제 전화번호 대신 070 안전번호가 제공돼요. 서로의 개인정보를 보호하기 위한 시스템이에요.");
        put("리뷰", "청소가 완료된 후 '내 의뢰' 페이지에서 리뷰를 작성할 수 있어요. 실제 완료된 의뢰에만 작성 가능해요.");
        put("업체 인증", "모든 업체는 사업자등록증 심사를 거쳐 인증된 업체만 등록돼요. ✅ 마크가 있는 업체는 인증 완료된 업체예요.");
        put("회원가입", "홈 화면 오른쪽 상단 '회원가입' 버튼을 클릭해 가입할 수 있어요. 고객과 업체 가입이 별도로 구분되어 있어요.");
        put("비밀번호", "현재 비밀번호 재설정 기능은 준비 중이에요. 이메일로 문의해 주시면 도움드릴게요.");
        put("환불", "환불은 업체와 직접 협의가 필요해요. 분쟁이 발생한 경우 고객센터로 문의해 주세요.");
        put("가격", "가격은 업체마다 다르며 업체 상세 페이지에서 확인할 수 있어요. 최종 가격은 견적서로 확정됩니다.");
    }};

    public String getAnswer(String userMessage) {
        // 1단계: FAQ에서 키워드 매칭
        for (Map.Entry<String, String> entry : FAQ.entrySet()) {
            if (userMessage.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        // 2단계: OpenAI API 호출
        if (!apiKey.equals("your-api-key-here")) {
            try {
                return callOpenAI(userMessage);
            } catch (Exception e) {
                log.error("OpenAI API 오류: {}", e.getMessage());
            }
        }

        // 3단계: 기본 응답
        return "죄송해요, 질문을 정확히 이해하지 못했어요. 😅\n"
                + "더 자세한 도움이 필요하시면 담당자에게 연결해드릴까요?";
    }

    private String callOpenAI(String userMessage) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", List.of(
                Map.of("role", "system", "content", SYSTEM_PROMPT),
                Map.of("role", "user", "content", userMessage)
        ));
        body.put("max_tokens", 300);
        body.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        Map response = restTemplate.postForObject(
                "https://api.openai.com/v1/chat/completions",
                request,
                Map.class
        );

        List choices = (List) response.get("choices");
        Map choice = (Map) choices.get(0);
        Map message = (Map) choice.get("message");
        return (String) message.get("content");
    }
}
