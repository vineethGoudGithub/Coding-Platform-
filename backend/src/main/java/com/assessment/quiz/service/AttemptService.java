package com.assessment.quiz.service;

import com.assessment.quiz.dto.*;
import com.assessment.quiz.entity.*;
import com.assessment.quiz.exception.BadRequestException;
import com.assessment.quiz.exception.ResourceNotFoundException;
import com.assessment.quiz.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttemptService {

    private static final Logger logger = LoggerFactory.getLogger(AttemptService.class);

    private final TestRepository testRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final QuestionRepository questionRepository;
    private final McqOptionRepository mcqOptionRepository;
    private final CodingQuestionRepository codingQuestionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final CodingSubmissionRepository codingSubmissionRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final TestService testService;
    private final StudentProfileRepository studentProfileRepository;

    @Transactional
    public AttemptDto startTest(Long testId, Long studentId) {
        Test test = testRepository.findByIdAndActiveTrue(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Active test not found with id: " + testId));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student user not found: " + studentId));

        // Check for existing IN_PROGRESS attempt (e.g. browser refresh / resume)
        Optional<TestAttempt> existing = testAttemptRepository
                .findFirstByTestIdAndStudentIdAndStatus(testId, studentId, AttemptStatus.IN_PROGRESS);

        if (existing.isPresent()) {
            TestAttempt attempt = existing.get();
            // Check if timer expired in the meantime
            if (LocalDateTime.now().isAfter(attempt.getEndTime())) {
                logger.info("Existing attempt {} expired for student {}", attempt.getId(), studentId);
                attempt.setStatus(AttemptStatus.EXPIRED);
                testAttemptRepository.save(attempt);
            } else {
                logger.info("Resuming existing attempt {} for student {}", attempt.getId(), studentId);
                return mapToAttemptDto(attempt);
            }
        }

        // Check maximum attempts
        List<TestAttempt> pastAttempts = testAttemptRepository.findAllByTestIdOrderByCreatedAtDesc(testId).stream()
                .filter(a -> a.getStudent().getId().equals(studentId))
                .toList();

        if (pastAttempts.size() >= test.getMaxAttempts()) {
            throw new BadRequestException("You have reached the maximum allowed attempts (" + test.getMaxAttempts() + ") for this test.");
        }

        // Create new attempt
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endTime = now.plusMinutes(test.getDurationMinutes());

        TestAttempt attempt = TestAttempt.builder()
                .test(test)
                .student(student)
                .status(AttemptStatus.IN_PROGRESS)
                .startTime(now)
                .endTime(endTime)
                .mcqScore(0)
                .codingScore(0)
                .totalScore(0)
                .percentage(0.0)
                .build();

        TestAttempt savedAttempt = testAttemptRepository.save(attempt);

        // Pre-create answer records and pre-populate coding templates
        List<Question> questions = questionRepository.findAllByTestIdOrderByQuestionOrderAsc(testId);
        for (Question q : questions) {
            String defaultDraft = null;
            if (q.getQuestionType() == QuestionType.CODING) {
                CodingQuestion cq = codingQuestionRepository.findByQuestionId(q.getId()).orElse(null);
                if (cq != null) {
                    defaultDraft = cq.getDefaultTemplate();
                }
            }

            StudentAnswer answer = StudentAnswer.builder()
                    .attempt(savedAttempt)
                    .question(q)
                    .codingDraft(defaultDraft)
                    .markedForReview(false)
                    .answered(false)
                    .build();
            studentAnswerRepository.save(answer);
        }

        // Log start event
        logAuditEvent(savedAttempt.getId(), studentId, "TEST_STARTED", "Student began test");

        logger.info("New attempt {} started for student {} on test {}", savedAttempt.getId(), studentId, testId);
        return mapToAttemptDto(savedAttempt);
    }

    @Transactional
    public AttemptDto getAttempt(Long attemptId, Long studentId, boolean isAdmin) {
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!isAdmin && !attempt.getStudent().getId().equals(studentId)) {
            throw new BadRequestException("Unauthorized access to attempt");
        }

        // Check if expired
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS && LocalDateTime.now().isAfter(attempt.getEndTime())) {
            logger.info("Attempt {} has expired; auto-submitting", attemptId);
            return autoSubmitExpiredAttempt(attempt);
        }

        return mapToAttemptDto(attempt);
    }

    @Transactional
    public StudentAnswerDto saveAnswer(Long attemptId, Long studentId, SaveAnswerRequest request) {
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getStudent().getId().equals(studentId)) {
            throw new BadRequestException("Unauthorized access to attempt");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Cannot save answer: attempt is already " + attempt.getStatus());
        }

        if (LocalDateTime.now().isAfter(attempt.getEndTime())) {
            attempt.setStatus(AttemptStatus.EXPIRED);
            testAttemptRepository.save(attempt);
            throw new BadRequestException("Test time limit has expired");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + request.getQuestionId()));

        StudentAnswer answer = studentAnswerRepository
                .findByAttemptIdAndQuestionId(attemptId, request.getQuestionId())
                .orElse(StudentAnswer.builder()
                        .attempt(attempt)
                        .question(question)
                        .build());

        if (request.getSelectedOptionId() != null) {
            McqOption option = mcqOptionRepository.findById(request.getSelectedOptionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Option not found: " + request.getSelectedOptionId()));
            answer.setSelectedOption(option);
            answer.setAnswered(true);
        }

        if (request.getCodingDraft() != null) {
            answer.setCodingDraft(request.getCodingDraft());
            if (!request.getCodingDraft().isBlank()) {
                answer.setAnswered(true);
            }
        }

        if (request.getMarkedForReview() != null) {
            answer.setMarkedForReview(request.getMarkedForReview());
        }

        StudentAnswer saved = studentAnswerRepository.save(answer);

        return StudentAnswerDto.builder()
                .id(saved.getId())
                .questionId(question.getId())
                .selectedOptionId(saved.getSelectedOption() != null ? saved.getSelectedOption().getId() : null)
                .codingDraft(saved.getCodingDraft())
                .markedForReview(saved.getMarkedForReview())
                .answered(saved.getAnswered())
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    @Transactional
    public SubmitAttemptResponse submitAttempt(Long attemptId, Long studentId) {
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getStudent().getId().equals(studentId)) {
            throw new BadRequestException("Unauthorized access to attempt");
        }

        if (attempt.getStatus() == AttemptStatus.SUBMITTED) {
            throw new BadRequestException("Test has already been submitted");
        }

        return evaluateAndCompleteAttempt(attempt);
    }

    private AttemptDto autoSubmitExpiredAttempt(TestAttempt attempt) {
        evaluateAndCompleteAttempt(attempt);
        return mapToAttemptDto(attempt);
    }

    private SubmitAttemptResponse evaluateAndCompleteAttempt(TestAttempt attempt) {
        SubmitAttemptResponse response = buildAttemptResultResponse(attempt);

        attempt.setStatus(AttemptStatus.SUBMITTED);
        if (attempt.getSubmittedAt() == null) {
            attempt.setSubmittedAt(LocalDateTime.now());
        }
        attempt.setMcqScore(response.getMcqScore());
        attempt.setCodingScore(response.getCodingScore());
        attempt.setTotalScore(response.getTotalScore());
        attempt.setPercentage(response.getPercentage());

        testAttemptRepository.save(attempt);

        logAuditEvent(attempt.getId(), attempt.getStudent().getId(), "TEST_SUBMITTED",
                "Total score: " + response.getTotalScore() + "/" + response.getMaxTotalScore() + " (" + response.getPercentage() + "%)");

        return response;
    }

    private SubmitAttemptResponse buildAttemptResultResponse(TestAttempt attempt) {
        Test test = attempt.getTest();
        List<Question> questions = questionRepository.findAllByTestIdOrderByQuestionOrderAsc(test.getId());
        List<StudentAnswer> answers = studentAnswerRepository.findAllByAttemptId(attempt.getId());

        int mcqScore = 0;
        int maxMcqScore = 0;
        int codingScore = 0;
        int maxCodingScore = 0;
        int mcqsCorrect = 0;
        int codingProblemsSolved = 0;
        int questionsAttempted = 0;

        List<QuestionResultSummaryDto> questionSummaries = new ArrayList<>();

        for (Question q : questions) {
            StudentAnswer ans = answers.stream()
                    .filter(a -> a.getQuestion().getId().equals(q.getId()))
                    .findFirst()
                    .orElse(null);

            boolean isAttempted = false;
            boolean isCorrect = false;
            int marksAwarded = 0;
            String studentAnswerText = "";
            String correctAnswerText = "";

            if (q.getQuestionType() == QuestionType.MCQ) {
                maxMcqScore += q.getMarks();

                List<McqOption> options = mcqOptionRepository.findAllByQuestionIdOrderByOptionKeyAsc(q.getId());
                McqOption correctOpt = options.stream().filter(o -> Boolean.TRUE.equals(o.getCorrect())).findFirst().orElse(null);
                correctAnswerText = correctOpt != null ? correctOpt.getOptionKey() + ". " + correctOpt.getOptionText() : "";

                if (ans != null && ans.getSelectedOption() != null) {
                    isAttempted = true;
                    questionsAttempted++;
                    studentAnswerText = ans.getSelectedOption().getOptionKey() + ". " + ans.getSelectedOption().getOptionText();

                    if (Boolean.TRUE.equals(ans.getSelectedOption().getCorrect())) {
                        isCorrect = true;
                        marksAwarded = q.getMarks();
                        mcqScore += marksAwarded;
                        mcqsCorrect++;
                    }
                }

                questionSummaries.add(QuestionResultSummaryDto.builder()
                        .questionId(q.getId())
                        .questionOrder(q.getQuestionOrder())
                        .title(q.getTitle())
                        .questionType(q.getQuestionType())
                        .marksAwarded(marksAwarded)
                        .maxMarks(q.getMarks())
                        .isCorrect(isCorrect)
                        .studentAnswer(studentAnswerText)
                        .correctAnswer(correctAnswerText)
                        .build());

            } else if (q.getQuestionType() == QuestionType.CODING) {
                maxCodingScore += q.getMarks();

                Optional<CodingSubmission> subOpt = codingSubmissionRepository
                        .findTopByAttemptIdAndQuestionIdOrderBySubmittedAtDesc(attempt.getId(), q.getId());

                int passedCases = 0;
                int totalCases = 0;

                if (subOpt.isPresent()) {
                    CodingSubmission sub = subOpt.get();
                    isAttempted = true;
                    questionsAttempted++;
                    passedCases = sub.getPassedCount();
                    totalCases = sub.getTotalCount();
                    marksAwarded = sub.getScoreAwarded();
                    codingScore += marksAwarded;
                    if (marksAwarded == q.getMarks() && q.getMarks() > 0) {
                        isCorrect = true;
                        codingProblemsSolved++;
                    }
                    studentAnswerText = sub.getSourceCode();
                } else if (ans != null && ans.getCodingDraft() != null && !ans.getCodingDraft().isBlank()) {
                    isAttempted = true;
                    questionsAttempted++;
                    studentAnswerText = ans.getCodingDraft();
                }

                questionSummaries.add(QuestionResultSummaryDto.builder()
                        .questionId(q.getId())
                        .questionOrder(q.getQuestionOrder())
                        .title(q.getTitle())
                        .questionType(q.getQuestionType())
                        .marksAwarded(marksAwarded)
                        .maxMarks(q.getMarks())
                        .isCorrect(isCorrect)
                        .studentAnswer(studentAnswerText)
                        .testCasesPassed(passedCases)
                        .totalTestCases(totalCases)
                        .build());
            }
        }

        int totalScore = mcqScore + codingScore;
        int maxTotalScore = maxMcqScore + maxCodingScore;
        double percentage = maxTotalScore > 0 ? ((double) totalScore / maxTotalScore) * 100.0 : 0.0;
        percentage = Math.round(percentage * 100.0) / 100.0;

        StudentProfile profile = studentProfileRepository.findByUserId(attempt.getStudent().getId()).orElse(null);

        return SubmitAttemptResponse.builder()
                .attemptId(attempt.getId())
                .testId(test.getId())
                .testTitle(test.getTitle())
                .studentName(profile != null ? profile.getFullName() : attempt.getStudent().getEmail())
                .rollNumber(profile != null ? profile.getRollNumber() : "")
                .studentClass(profile != null ? profile.getStudentClass() : "")
                .section(profile != null ? profile.getSection() : "")
                .mcqScore(attempt.getMcqScore() != null ? attempt.getMcqScore() : mcqScore)
                .maxMcqScore(maxMcqScore)
                .codingScore(attempt.getCodingScore() != null ? attempt.getCodingScore() : codingScore)
                .maxCodingScore(maxCodingScore)
                .totalScore(attempt.getTotalScore() != null ? attempt.getTotalScore() : totalScore)
                .maxTotalScore(maxTotalScore)
                .percentage(attempt.getPercentage() != null ? attempt.getPercentage() : percentage)
                .status((attempt.getPercentage() != null ? attempt.getPercentage() : percentage) >= 40.0 ? "PASSED" : "FAILED")
                .questionsAttempted(questionsAttempted)
                .totalQuestions(questions.size())
                .mcqsCorrect(mcqsCorrect)
                .codingProblemsSolved(codingProblemsSolved)
                .submittedAt(attempt.getSubmittedAt())
                .questionResults(questionSummaries)
                .build();
    }

    @Transactional(readOnly = true)
    public SubmitAttemptResponse getResult(Long attemptId, Long currentUserId, boolean isAdmin) {
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + attemptId));

        if (!isAdmin && !attempt.getStudent().getId().equals(currentUserId)) {
            throw new BadRequestException("Unauthorized access to result");
        }

        return buildAttemptResultResponse(attempt);
    }

    public void logAuditEvent(Long attemptId, Long studentId, String eventType, String eventData) {
        try {
            AuditLog log = AuditLog.builder()
                    .attemptId(attemptId)
                    .studentId(studentId)
                    .eventType(eventType)
                    .eventData(eventData)
                    .build();
            auditLogRepository.save(log);
        } catch (Exception e) {
            logger.warn("Failed to save audit log: {}", e.getMessage());
        }
    }

    public AttemptDto mapToAttemptDto(TestAttempt attempt) {
        long remainingSeconds = 0;
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(attempt.getEndTime())) {
                remainingSeconds = Duration.between(now, attempt.getEndTime()).getSeconds();
            }
        }

        List<StudentAnswerDto> answerDtos = studentAnswerRepository.findAllByAttemptId(attempt.getId()).stream()
                .map(a -> StudentAnswerDto.builder()
                        .id(a.getId())
                        .questionId(a.getQuestion().getId())
                        .selectedOptionId(a.getSelectedOption() != null ? a.getSelectedOption().getId() : null)
                        .codingDraft(a.getCodingDraft())
                        .markedForReview(a.getMarkedForReview())
                        .answered(a.getAnswered())
                        .updatedAt(a.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        TestDto testDto = testService.mapToStudentTestDto(attempt.getTest());

        return AttemptDto.builder()
                .id(attempt.getId())
                .testId(attempt.getTest().getId())
                .testTitle(attempt.getTest().getTitle())
                .status(attempt.getStatus())
                .startTime(attempt.getStartTime())
                .endTime(attempt.getEndTime())
                .submittedAt(attempt.getSubmittedAt())
                .remainingSeconds(remainingSeconds)
                .mcqScore(attempt.getMcqScore())
                .codingScore(attempt.getCodingScore())
                .totalScore(attempt.getTotalScore())
                .percentage(attempt.getPercentage())
                .test(testDto)
                .answers(answerDtos)
                .build();
    }
}
