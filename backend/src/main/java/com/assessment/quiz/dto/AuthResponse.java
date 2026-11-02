package com.assessment.quiz.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String role;
    private Long userId;
    private String email;
    private String fullName;
    private String rollNumber;
    private String studentClass;
    private String section;
    private Long attemptId;
}
