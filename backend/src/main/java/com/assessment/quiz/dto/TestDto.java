package com.assessment.quiz.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestDto {
    private Long id;
    private String title;
    private String description;
    private Integer durationMinutes;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxAttempts;
    private Boolean active;
    private Integer totalMarks;
    private Integer questionCount;
    private List<QuestionDto> questions;
    private LocalDateTime createdAt;
}
