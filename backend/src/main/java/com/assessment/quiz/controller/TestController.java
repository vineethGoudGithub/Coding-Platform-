package com.assessment.quiz.controller;

import com.assessment.quiz.dto.ApiResponse;
import com.assessment.quiz.dto.TestDto;
import com.assessment.quiz.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TestDto>>> getActiveTests() {
        List<TestDto> tests = testService.getActiveTests();
        return ResponseEntity.ok(ApiResponse.success(tests));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TestDto>> getTestById(@PathVariable Long id) {
        TestDto test = testService.getTestByIdForStudent(id);
        return ResponseEntity.ok(ApiResponse.success(test));
    }
}
