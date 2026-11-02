package com.assessment.quiz.controller;

import com.assessment.quiz.dto.ApiResponse;
import com.assessment.quiz.dto.CodeRunRequest;
import com.assessment.quiz.dto.CodeRunResponse;
import com.assessment.quiz.dto.CodeSubmitRequest;
import com.assessment.quiz.dto.CodeSubmitResponse;
import com.assessment.quiz.security.CustomUserDetails;
import com.assessment.quiz.service.CodeExecutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/code")
@RequiredArgsConstructor
public class CodeExecutionController {

    private final CodeExecutionService codeExecutionService;

    @PostMapping("/run")
    public ResponseEntity<ApiResponse<CodeRunResponse>> runCode(
            @Valid @RequestBody CodeRunRequest request,
            @AuthenticationPrincipal CustomUserDetails userPrincipal
    ) {
        CodeRunResponse response = codeExecutionService.runCode(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<CodeSubmitResponse>> submitCode(
            @Valid @RequestBody CodeSubmitRequest request,
            @AuthenticationPrincipal CustomUserDetails userPrincipal
    ) {
        CodeSubmitResponse response = codeExecutionService.submitCode(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
