package com.assessment.quiz.controller;

import com.assessment.quiz.dto.ApiResponse;
import com.assessment.quiz.dto.AuthRequest;
import com.assessment.quiz.dto.AuthResponse;
import com.assessment.quiz.dto.RegisterRequest;
import com.assessment.quiz.dto.UserDto;
import com.assessment.quiz.security.CustomUserDetails;
import com.assessment.quiz.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/candidate-entry")
    public ResponseEntity<ApiResponse<AuthResponse>> candidateEntry(@Valid @RequestBody com.assessment.quiz.dto.CandidateEntryRequest request) {
        AuthResponse response = authService.candidateEntry(request);
        return ResponseEntity.ok(ApiResponse.success("Candidate verified", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userPrincipal) {
        UserDto userDto = authService.getCurrentUser(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }
}
