package com.assessment.quiz.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitAttemptResponse {
    private Long attemptId;
    private Long testId;
    private String testTitle;
    private String studentName;
    private String rollNumber;
    private String studentClass;
    private String section;
    private Integer mcqScore;
    private Integer maxMcqScore;
    private Integer codingScore;
    private Integer maxCodingScore;
    private Integer totalScore;
    private Integer maxTotalScore;
    private Double percentage;
    private String status; // PASSED or FAILED
    private Integer questionsAttempted;
    private Integer totalQuestions;
    private Integer mcqsCorrect;
    private Integer codingProblemsSolved;
    private LocalDateTime submittedAt;
    private List<QuestionResultSummaryDto> questionResults;
}
