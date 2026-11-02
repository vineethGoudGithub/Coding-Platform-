package com.assessment.quiz.controller;

import com.assessment.quiz.dto.*;
import com.assessment.quiz.security.CustomUserDetails;
import com.assessment.quiz.service.AttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;

    @PostMapping("/tests/{id}/start")
    public ResponseEntity<ApiResponse<AttemptDto>> startTest(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userPrincipal
    ) {
        AttemptDto attempt = attemptService.startTest(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Test session initialized", attempt));
    }

    @GetMapping("/attempts/{id}")
    public ResponseEntity<ApiResponse<AttemptDto>> getAttempt(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        AttemptDto attempt = attemptService.getAttempt(id, userPrincipal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(attempt));
    }

    @PostMapping("/attempts/{id}/answers")
    public ResponseEntity<ApiResponse<StudentAnswerDto>> saveAnswer(
            @PathVariable Long id,
            @Valid @RequestBody SaveAnswerRequest request,
            @AuthenticationPrincipal CustomUserDetails userPrincipal
    ) {
        StudentAnswerDto saved = attemptService.saveAnswer(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Answer saved", saved));
    }

    @PostMapping("/attempts/{id}/submit")
    public ResponseEntity<ApiResponse<SubmitAttemptResponse>> submitAttempt(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userPrincipal
    ) {
        SubmitAttemptResponse response = attemptService.submitAttempt(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Assessment submitted successfully", response));
    }

    @PostMapping("/attempts/{id}/audit")
    public ResponseEntity<ApiResponse<Void>> logAudit(
            @PathVariable Long id,
            @Valid @RequestBody AuditLogRequest request,
            @AuthenticationPrincipal CustomUserDetails userPrincipal
    ) {
        attemptService.logAuditEvent(id, userPrincipal.getId(), request.getEventType(), request.getEventData());
        return ResponseEntity.ok(ApiResponse.success("Audit event logged", null));
    }
}
