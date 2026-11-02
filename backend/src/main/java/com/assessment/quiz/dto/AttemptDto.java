package com.assessment.quiz.dto;

import com.assessment.quiz.entity.AttemptStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptDto {
    private Long id;
    private Long testId;
    private String testTitle;
    private AttemptStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime submittedAt;
    private Long remainingSeconds;
    private Integer mcqScore;
    private Integer codingScore;
    private Integer totalScore;
    private Double percentage;
    private TestDto test;
    private List<StudentAnswerDto> answers;
}
