package com.assessment.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogRequest {
    private Long attemptId;

    @NotBlank(message = "Event type is required")
    private String eventType;

    private String eventData;
}
