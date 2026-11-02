package com.assessment.quiz.dto;

import com.assessment.quiz.entity.QuestionType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuestionDto {
    private Long id;
    private Long testId;
    private QuestionType questionType;
    private Integer questionOrder;
    private Integer marks;
    private String title;
    private String problemStatement;
    private List<McqOptionDto> options;
    private CodingQuestionDto codingQuestion;
}
