package com.assessment.quiz.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class McqOptionDto {
    private Long id;
    private String optionKey;
    private String optionText;
    private Boolean isCorrect; // Only present for Admin or post-submission review
}
