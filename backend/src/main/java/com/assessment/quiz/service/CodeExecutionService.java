package com.assessment.quiz.service;

import com.assessment.quiz.dto.CodeRunRequest;
import com.assessment.quiz.dto.CodeRunResponse;
import com.assessment.quiz.dto.CodeSubmitRequest;
import com.assessment.quiz.dto.CodeSubmitResponse;
import com.assessment.quiz.entity.*;
import com.assessment.quiz.exception.BadRequestException;
import com.assessment.quiz.exception.RateLimitExceededException;
import com.assessment.quiz.exception.ResourceNotFoundException;
import com.assessment.quiz.repository.*;
import com.assessment.quiz.service.judge0.Judge0Client;
import com.assessment.quiz.service.judge0.Judge0Response;
import com.assessment.quiz.util.OutputNormalizer;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class CodeExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(CodeExecutionService.class);

    private final Judge0Client judge0Client;
    private final TestAttemptRepository testAttemptRepository;
    private final QuestionRepository questionRepository;
    private final CodingQuestionRepository codingQuestionRepository;
    private final TestCaseRepository testCaseRepository;
    private final CodingSubmissionRepository codingSubmissionRepository;
    private final StudentAnswerRepository studentAnswerRepository;

    @Value("${app.judge0.rate-limit-per-minute:15}")
    private int rateLimitPerMinute;

    @Value("${app.judge0.max-output-length:10000}")
    private int maxOutputLength;

    // In-memory token bucket/sliding window rate limiter per user ID
    private final Map<Long, List<Long>> rateLimitMap = new ConcurrentHashMap<>();

    public void checkRateLimit(Long userId) {
        long now = System.currentTimeMillis();
        long windowStart = now - 60000L;

        rateLimitMap.compute(userId, (k, timestamps) -> {
            if (timestamps == null) {
                timestamps = new ArrayList<>();
            }
            // Remove older than 1 minute
            timestamps.removeIf(ts -> ts < windowStart);
            if (timestamps.size() >= rateLimitPerMinute) {
                throw new RateLimitExceededException(
                        "Code execution rate limit exceeded. You can run code at most " + rateLimitPerMinute + " times per minute."
                );
            }
            timestamps.add(now);
            return timestamps;
        });
    }

    public CodeRunResponse runCode(Long userId, CodeRunRequest request) {
        checkRateLimit(userId);

        logger.info("User {} running code (length: {} chars)", userId, request.getSourceCode().length());

        Judge0Response judgeResponse = judge0Client.execute(
                request.getSourceCode(),
                request.getStdin(),
                null
        );

        String stdout = truncate(judgeResponse.getStdout());
        String stderr = truncate(judgeResponse.getStderr());
        String compileOutput = truncate(judgeResponse.getCompileOutput());

        return CodeRunResponse.builder()
                .status(judgeResponse.getStatusDescription())
                .stdout(stdout)
                .stderr(stderr)
                .compileOutput(compileOutput)
                .executionTime(judgeResponse.getTimeInSeconds())
                .memory(judgeResponse.getMemory())
                .build();
    }

    @Transactional
    public CodeSubmitResponse submitCode(Long userId, CodeSubmitRequest request) {
        checkRateLimit(userId);

        TestAttempt attempt = testAttemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new ResourceNotFoundException("Test attempt not found: " + request.getAttemptId()));

        if (!attempt.getStudent().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized attempt access");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Attempt is already " + attempt.getStatus());
        }

        if (LocalDateTime.now().isAfter(attempt.getEndTime())) {
            attempt.setStatus(AttemptStatus.EXPIRED);
            testAttemptRepository.save(attempt);
            throw new BadRequestException("Test time limit has expired");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + request.getQuestionId()));

        if (question.getQuestionType() != QuestionType.CODING) {
            throw new BadRequestException("Specified question is not a coding question");
        }

        CodingQuestion codingQuestion = codingQuestionRepository.findByQuestionId(question.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Coding question details not found"));

        List<TestCase> testCases = testCaseRepository.findAllByCodingQuestionIdOrderByTestCaseOrderAsc(codingQuestion.getId());

        int passedCount = 0;
        int totalCount = testCases.size();
        List<CodeSubmitResponse.TestCaseResultSummary> testResults = new ArrayList<>();
        String overallStatus = "ACCEPTED";

        int caseNum = 1;
        for (TestCase tc : testCases) {
            Judge0Response response = judge0Client.execute(
                    request.getSourceCode(),
                    tc.getInputData(),
                    tc.getExpectedOutput()
            );

            boolean isCorrect = false;
            String statusDesc = response.getStatusDescription();

            if (response.isAccepted() || OutputNormalizer.matches(response.getStdout(), tc.getExpectedOutput())) {
                isCorrect = true;
                passedCount++;
                statusDesc = "Passed";
            } else {
                if (overallStatus.equals("ACCEPTED")) {
                    overallStatus = statusDesc.equalsIgnoreCase("Accepted") ? "Wrong Answer" : statusDesc;
                }
            }

            testResults.add(CodeSubmitResponse.TestCaseResultSummary.builder()
                    .testCaseNumber(caseNum++)
                    .passed(isCorrect)
                    .status(statusDesc)
                    .executionTime(response.getTimeInSeconds())
                    .build());
        }

        // Full marks only if all test cases pass
        int scoreAwarded = (passedCount == totalCount && totalCount > 0) ? question.getMarks() : 0;

        // Save or update coding submission record
        CodingSubmission submission = codingSubmissionRepository
                .findTopByAttemptIdAndQuestionIdOrderBySubmittedAtDesc(attempt.getId(), question.getId())
                .orElse(CodingSubmission.builder()
                        .attempt(attempt)
                        .question(question)
                        .build());

        submission.setSourceCode(request.getSourceCode());
        submission.setLanguage(request.getLanguage());
        submission.setPassedCount(passedCount);
        submission.setTotalCount(totalCount);
        submission.setScoreAwarded(scoreAwarded);
        submission.setStatus(overallStatus);
        submission.setSubmittedAt(LocalDateTime.now());
        codingSubmissionRepository.save(submission);

        // Also update the draft answer
        StudentAnswer studentAnswer = studentAnswerRepository
                .findByAttemptIdAndQuestionId(attempt.getId(), question.getId())
                .orElse(StudentAnswer.builder()
                        .attempt(attempt)
                        .question(question)
                        .build());

        studentAnswer.setCodingDraft(request.getSourceCode());
        studentAnswer.setAnswered(true);
        studentAnswerRepository.save(studentAnswer);

        logger.info("Student {} submitted code for question {}: {}/{} passed, score={}",
                userId, question.getId(), passedCount, totalCount, scoreAwarded);

        return CodeSubmitResponse.builder()
                .passedCount(passedCount)
                .totalCount(totalCount)
                .scoreAwarded(scoreAwarded)
                .status(overallStatus)
                .message(passedCount == totalCount ? "All test cases passed!" : passedCount + " of " + totalCount + " test cases passed.")
                .testResults(testResults)
                .build();
    }

    private String truncate(String text) {
        if (text == null) {
            return null;
        }
        if (text.length() > maxOutputLength) {
            return text.substring(0, maxOutputLength) + "\n... [Output truncated]";
        }
        return text;
    }
}
