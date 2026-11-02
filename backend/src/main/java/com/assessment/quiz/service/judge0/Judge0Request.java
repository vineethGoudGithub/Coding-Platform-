package com.assessment.quiz.service.judge0;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Judge0Request {

    @JsonProperty("source_code")
    private String sourceCode;

    @JsonProperty("language_id")
    private Integer languageId;

    @JsonProperty("stdin")
    private String stdin;

    @JsonProperty("expected_output")
    private String expectedOutput;

    @JsonProperty("cpu_time_limit")
    @Builder.Default
    private Double cpuTimeLimit = 5.0;

    @JsonProperty("memory_limit")
    @Builder.Default
    private Integer memoryLimit = 128000; // in KB
}
