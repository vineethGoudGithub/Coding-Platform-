package com.assessment.quiz.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardStatsDto {
    private long totalStudents;
    private long totalTests;
    private long activeTests;
    private long completedAttempts;
    private double averageScore;
    private List<AdminResultItemDto> recentResults;
}
