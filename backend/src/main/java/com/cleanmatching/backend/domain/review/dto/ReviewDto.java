package com.cleanmatching.backend.domain.review.dto;

import lombok.*;

public class ReviewDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private Integer score;
        private Integer scoreKindness;
        private Integer scorePunctuality;
        private Integer scoreQuality;
        private String content;
    }
}
