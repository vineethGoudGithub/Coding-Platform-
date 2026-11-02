package com.assessment.quiz.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveAnswerRequest {
    @NotNull(message = "Question ID is required")
    private Long questionId;

    private Long selectedOptionId;
    private String codingDraft;
    private Boolean markedForReview;
}
