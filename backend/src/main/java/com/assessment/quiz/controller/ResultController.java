package com.assessment.quiz.controller;

import com.assessment.quiz.dto.ApiResponse;
import com.assessment.quiz.dto.SubmitAttemptResponse;
import com.assessment.quiz.security.CustomUserDetails;
import com.assessment.quiz.service.AttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final AttemptService attemptService;

    @GetMapping("/{attemptId}")
    public ResponseEntity<ApiResponse<SubmitAttemptResponse>> getResult(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal CustomUserDetails userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        SubmitAttemptResponse response = attemptService.getResult(attemptId, userPrincipal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
