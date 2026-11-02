package com.assessment.quiz.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeSubmitResponse {
    private int passedCount;
    private int totalCount;
    private int scoreAwarded;
    private String status; // ACCEPTED, WRONG_ANSWER, COMPILATION_ERROR, etc.
    private String message;
    private List<TestCaseResultSummary> testResults; // summary showing Test 1: Passed, Test 2: Passed without revealing hidden inputs
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TestCaseResultSummary {
        private int testCaseNumber;
        private boolean passed;
        private String status;
        private Double executionTime;
    }
}
