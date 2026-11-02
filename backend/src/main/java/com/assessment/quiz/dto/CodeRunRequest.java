package com.assessment.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeRunRequest {
    @NotBlank(message = "Source code is required")
    private String sourceCode;

    @Builder.Default
    private String language = "java";

    private String stdin;
}
