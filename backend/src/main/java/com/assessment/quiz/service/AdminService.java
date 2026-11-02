package com.assessment.quiz.service;

import com.assessment.quiz.dto.AdminDashboardStatsDto;
import com.assessment.quiz.dto.AdminResultItemDto;
import com.assessment.quiz.dto.UserDto;
import com.assessment.quiz.entity.AttemptStatus;
import com.assessment.quiz.entity.Role;
import com.assessment.quiz.entity.StudentProfile;
import com.assessment.quiz.entity.TestAttempt;
import com.assessment.quiz.repository.StudentProfileRepository;
import com.assessment.quiz.repository.TestAttemptRepository;
import com.assessment.quiz.repository.TestRepository;
import com.assessment.quiz.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TestRepository testRepository;
    private final TestAttemptRepository testAttemptRepository;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalTests = testRepository.count();
        long activeTests = testRepository.countActiveTests();
        long completedAttempts = testAttemptRepository.countByStatus(AttemptStatus.SUBMITTED);
        Double avg = testAttemptRepository.findAverageScore();
        double averageScore = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;

        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "submittedAt"));
        Page<TestAttempt> recentAttemptsPage = testAttemptRepository.findFilteredAttempts(
                AttemptStatus.SUBMITTED, null, null, null, pageable
        );

        List<AdminResultItemDto> recentResults = recentAttemptsPage.getContent().stream()
                .map(this::mapToResultItemDto)
                .collect(Collectors.toList());

        return AdminDashboardStatsDto.builder()
                .totalStudents(totalStudents)
                .totalTests(totalTests)
                .activeTests(activeTests)
                .completedAttempts(completedAttempts)
                .averageScore(averageScore)
                .recentResults(recentResults)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<AdminResultItemDto> getFilteredResults(
            AttemptStatus status,
            Long testId,
            String section,
            String search,
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        Sort sort = Sort.by(
                "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy != null && !sortBy.isBlank() ? sortBy : "submittedAt"
        );

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<TestAttempt> attempts = testAttemptRepository.findFilteredAttempts(status, testId, section, search, pageable);
        return attempts.map(this::mapToResultItemDto);
    }

    @Transactional(readOnly = true)
    public byte[] exportResultsCsv() {
        List<TestAttempt> attempts = testAttemptRepository.findTopResultsForExport();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            // Write CSV Header
            writer.println("Student Name,Roll No,Class,Section,Test,MCQ Score,Coding Score,Total Score,Percentage,Submitted At");

            for (TestAttempt a : attempts) {
                StudentProfile p = a.getStudent().getStudentProfile();
                String studentName = p != null ? escapeCsv(p.getFullName()) : escapeCsv(a.getStudent().getEmail());
                String rollNo = p != null ? escapeCsv(p.getRollNumber()) : "";
                String studentClass = p != null ? escapeCsv(p.getStudentClass()) : "";
                String section = p != null ? escapeCsv(p.getSection()) : "";
                String testName = escapeCsv(a.getTest().getTitle());
                String submittedAt = a.getSubmittedAt() != null ? a.getSubmittedAt().format(DATE_TIME_FORMATTER) : "";

                writer.printf("%s,%s,%s,%s,%s,%d,%d,%d,%.1f%%,%s%n",
                        studentName,
                        rollNo,
                        studentClass,
                        section,
                        testName,
                        a.getMcqScore(),
                        a.getCodingScore(),
                        a.getTotalScore(),
                        a.getPercentage(),
                        submittedAt
                );
            }
        }

        return out.toByteArray();
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllStudents() {
        return studentProfileRepository.findAll().stream()
                .map(p -> UserDto.builder()
                        .id(p.getUser().getId())
                        .email(p.getUser().getEmail())
                        .role(p.getUser().getRole().name())
                        .fullName(p.getFullName())
                        .rollNumber(p.getRollNumber())
                        .studentClass(p.getStudentClass())
                        .section(p.getSection())
                        .build())
                .collect(Collectors.toList());
    }

    private AdminResultItemDto mapToResultItemDto(TestAttempt a) {
        StudentProfile p = a.getStudent().getStudentProfile();
        return AdminResultItemDto.builder()
                .attemptId(a.getId())
                .testId(a.getTest().getId())
                .testTitle(a.getTest().getTitle())
                .studentId(a.getStudent().getId())
                .studentName(p != null ? p.getFullName() : a.getStudent().getEmail())
                .rollNumber(p != null ? p.getRollNumber() : "")
                .studentClass(p != null ? p.getStudentClass() : "")
                .section(p != null ? p.getSection() : "")
                .email(a.getStudent().getEmail())
                .mcqScore(a.getMcqScore())
                .codingScore(a.getCodingScore())
                .totalScore(a.getTotalScore())
                .maxMarks(a.getTest().getTotalMarks())
                .percentage(a.getPercentage())
                .status(a.getStatus().name())
                .startTime(a.getStartTime())
                .submittedAt(a.getSubmittedAt())
                .build();
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
