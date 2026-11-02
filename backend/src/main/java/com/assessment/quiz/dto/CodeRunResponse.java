package com.assessment.quiz.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeRunResponse {
    private String status; // Accepted, Compilation Error, Runtime Error, Time Limit Exceeded
    private String stdout;
    private String stderr;
    private String compileOutput;
    private Double executionTime;
    private Integer memory;
}
