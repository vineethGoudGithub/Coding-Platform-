package com.assessment.quiz.dto;

import com.assessment.quiz.entity.QuestionType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResultSummaryDto {
    private Long questionId;
    private Integer questionOrder;
    private String title;
    private QuestionType questionType;
    private Integer marksAwarded;
    private Integer maxMarks;
    private Boolean isCorrect;
    private String studentAnswer;
    private String correctAnswer; // Only displayed in results
    private Integer testCasesPassed;
    private Integer totalTestCases;
}
