package com.assessment.quiz.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestCaseDto {
    private Long id;
    private String inputData;
    private String expectedOutput;
    private Boolean isHidden;
    private Integer testCaseOrder;
}
