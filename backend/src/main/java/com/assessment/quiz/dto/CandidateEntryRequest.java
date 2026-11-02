package com.assessment.quiz.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateEntryRequest {
    @NotBlank(message = "Candidate name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "Class is required")
    private String studentClass;

    @NotBlank(message = "Section is required")
    private String section;

    private String rollNumber;

    private Long testId;
}
