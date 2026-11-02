package com.assessment.quiz.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAnswerDto {
    private Long id;
    private Long questionId;
    private Long selectedOptionId;
    private String codingDraft;
    private Boolean markedForReview;
    private Boolean answered;
    private LocalDateTime updatedAt;
}
