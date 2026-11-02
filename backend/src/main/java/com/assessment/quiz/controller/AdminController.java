package com.assessment.quiz.controller;

import com.assessment.quiz.dto.*;
import com.assessment.quiz.entity.AttemptStatus;
import com.assessment.quiz.service.AdminService;
import com.assessment.quiz.service.TestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final TestService testService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDto>> getDashboardStats() {
        AdminDashboardStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/tests")
    public ResponseEntity<ApiResponse<List<TestDto>>> getAllTests() {
        List<TestDto> tests = testService.getAllTestsForAdmin();
        return ResponseEntity.ok(ApiResponse.success(tests));
    }

    @GetMapping("/tests/{id}")
    public ResponseEntity<ApiResponse<TestDto>> getTestById(@PathVariable Long id) {
        TestDto test = testService.getTestByIdForAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(test));
    }

    @PostMapping("/tests")
    public ResponseEntity<ApiResponse<TestDto>> createTest(@Valid @RequestBody TestDto dto) {
        TestDto created = testService.createTest(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Test created successfully", created));
    }

    @PutMapping("/tests/{id}")
    public ResponseEntity<ApiResponse<TestDto>> updateTest(@PathVariable Long id, @Valid @RequestBody TestDto dto) {
        TestDto updated = testService.updateTest(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Test updated successfully", updated));
    }

    @DeleteMapping("/tests/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTest(@PathVariable Long id) {
        testService.deleteTest(id);
        return ResponseEntity.ok(ApiResponse.success("Test deleted successfully", null));
    }

    @PostMapping("/tests/{id}/duplicate")
    public ResponseEntity<ApiResponse<TestDto>> duplicateTest(@PathVariable Long id) {
        TestDto duplicated = testService.duplicateTest(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Test duplicated successfully", duplicated));
    }

    @PatchMapping("/tests/{id}/publish")
    public ResponseEntity<ApiResponse<TestDto>> togglePublish(@PathVariable Long id) {
        TestDto updated = testService.togglePublish(id);
        return ResponseEntity.ok(ApiResponse.success("Publish status updated", updated));
    }

    @GetMapping("/results")
    public ResponseEntity<ApiResponse<Page<AdminResultItemDto>>> getResults(
            @RequestParam(required = false) AttemptStatus status,
            @RequestParam(required = false) Long testId,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Page<AdminResultItemDto> results = adminService.getFilteredResults(
                status, testId, section, search, page, size, sortBy, direction
        );
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/results/export")
    public ResponseEntity<byte[]> exportResults() {
        byte[] csvData = adminService.exportResultsCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"assessment_results.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<UserDto>>> getStudents() {
        List<UserDto> students = adminService.getAllStudents();
        return ResponseEntity.ok(ApiResponse.success(students));
    }
}
