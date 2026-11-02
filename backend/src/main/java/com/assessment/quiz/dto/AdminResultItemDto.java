package com.assessment.quiz.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminResultItemDto {
    private Long attemptId;
    private Long testId;
    private String testTitle;
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private String studentClass;
    private String section;
    private String email;
    private Integer mcqScore;
    private Integer maxMcqScore;
    private Integer codingScore;
    private Integer maxCodingScore;
    private Integer totalScore;
    private Integer maxMarks;
    private Double percentage;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime submittedAt;
}
