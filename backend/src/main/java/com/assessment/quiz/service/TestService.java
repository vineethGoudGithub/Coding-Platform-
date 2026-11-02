package com.assessment.quiz.service;

import com.assessment.quiz.dto.*;
import com.assessment.quiz.entity.*;
import com.assessment.quiz.exception.ResourceNotFoundException;
import com.assessment.quiz.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestService {

    private static final Logger logger = LoggerFactory.getLogger(TestService.class);

    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final McqOptionRepository mcqOptionRepository;
    private final CodingQuestionRepository codingQuestionRepository;
    private final TestCaseRepository testCaseRepository;

    @Transactional(readOnly = true)
    public List<TestDto> getActiveTests() {
        return testRepository.findAllByActiveTrue().stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestDto> getAllTestsForAdmin() {
        return testRepository.findAll().stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestDto getTestByIdForStudent(Long testId) {
        Test test = testRepository.findByIdAndActiveTrue(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Active test not found with id: " + testId));

        return mapToStudentTestDto(test);
    }

    @Transactional(readOnly = true)
    public TestDto getTestByIdForAdmin(Long testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with id: " + testId));

        return mapToAdminTestDto(test);
    }

    @Transactional
    public TestDto createTest(TestDto dto) {
        Test test = Test.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .durationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 30)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .maxAttempts(dto.getMaxAttempts() != null ? dto.getMaxAttempts() : 1)
                .active(dto.getActive() != null ? dto.getActive() : true)
                .totalMarks(dto.getTotalMarks() != null ? dto.getTotalMarks() : 10)
                .build();

        Test saved = testRepository.save(test);

        if (dto.getQuestions() != null) {
            for (QuestionDto qDto : dto.getQuestions()) {
                saveQuestionFromDto(saved, qDto);
            }
        }

        logger.info("Admin created new test: id={}, title={}", saved.getId(), saved.getTitle());
        return mapToAdminTestDto(saved);
    }

    @Transactional
    public TestDto updateTest(Long testId, TestDto dto) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with id: " + testId));

        test.setTitle(dto.getTitle());
        test.setDescription(dto.getDescription());
        test.setDurationMinutes(dto.getDurationMinutes());
        test.setStartTime(dto.getStartTime());
        test.setEndTime(dto.getEndTime());
        test.setMaxAttempts(dto.getMaxAttempts());
        if (dto.getActive() != null) {
            test.setActive(dto.getActive());
        }
        if (dto.getTotalMarks() != null) {
            test.setTotalMarks(dto.getTotalMarks());
        }

        Test updated = testRepository.save(test);
        logger.info("Admin updated test: id={}", testId);
        return mapToAdminTestDto(updated);
    }

    @Transactional
    public void deleteTest(Long testId) {
        if (!testRepository.existsById(testId)) {
            throw new ResourceNotFoundException("Test not found with id: " + testId);
        }
        testRepository.deleteById(testId);
        logger.info("Admin deleted test: id={}", testId);
    }

    @Transactional
    public TestDto togglePublish(Long testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with id: " + testId));
        test.setActive(!test.getActive());
        Test saved = testRepository.save(test);
        logger.info("Admin toggled publish for test id={}, active={}", testId, saved.getActive());
        return mapToAdminTestDto(saved);
    }

    @Transactional
    public TestDto duplicateTest(Long testId) {
        Test source = testRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with id: " + testId));

        Test copy = Test.builder()
                .title(source.getTitle() + " (Copy)")
                .description(source.getDescription())
                .durationMinutes(source.getDurationMinutes())
                .startTime(source.getStartTime())
                .endTime(source.getEndTime())
                .maxAttempts(source.getMaxAttempts())
                .active(false) // Start as unpublished draft
                .totalMarks(source.getTotalMarks())
                .build();

        Test savedCopy = testRepository.save(copy);

        List<Question> sourceQuestions = questionRepository.findAllByTestIdOrderByQuestionOrderAsc(testId);
        for (Question sq : sourceQuestions) {
            Question qCopy = Question.builder()
                    .test(savedCopy)
                    .questionType(sq.getQuestionType())
                    .questionOrder(sq.getQuestionOrder())
                    .marks(sq.getMarks())
                    .title(sq.getTitle())
                    .problemStatement(sq.getProblemStatement())
                    .build();
            Question savedQCopy = questionRepository.save(qCopy);

            if (sq.getQuestionType() == QuestionType.MCQ) {
                List<McqOption> options = mcqOptionRepository.findAllByQuestionIdOrderByOptionKeyAsc(sq.getId());
                for (McqOption opt : options) {
                    McqOption optCopy = McqOption.builder()
                            .question(savedQCopy)
                            .optionKey(opt.getOptionKey())
                            .optionText(opt.getOptionText())
                            .correct(opt.getCorrect())
                            .build();
                    mcqOptionRepository.save(optCopy);
                }
            } else if (sq.getQuestionType() == QuestionType.CODING) {
                codingQuestionRepository.findByQuestionId(sq.getId()).ifPresent(scq -> {
                    CodingQuestion cqCopy = CodingQuestion.builder()
                            .question(savedQCopy)
                            .inputFormat(scq.getInputFormat())
                            .outputFormat(scq.getOutputFormat())
                            .constraints(scq.getConstraints())
                            .sampleInput(scq.getSampleInput())
                            .sampleOutput(scq.getSampleOutput())
                            .language(scq.getLanguage())
                            .defaultTemplate(scq.getDefaultTemplate())
                            .build();
                    CodingQuestion savedCqCopy = codingQuestionRepository.save(cqCopy);

                    List<TestCase> testCases = testCaseRepository.findAllByCodingQuestionIdOrderByTestCaseOrderAsc(scq.getId());
                    for (TestCase tc : testCases) {
                        TestCase tcCopy = TestCase.builder()
                                .codingQuestion(savedCqCopy)
                                .inputData(tc.getInputData())
                                .expectedOutput(tc.getExpectedOutput())
                                .hidden(tc.getHidden())
                                .testCaseOrder(tc.getTestCaseOrder())
                                .build();
                        testCaseRepository.save(tcCopy);
                    }
                });
            }
        }

        logger.info("Admin duplicated test: originalId={}, newId={}", testId, savedCopy.getId());
        return mapToAdminTestDto(savedCopy);
    }

    private void saveQuestionFromDto(Test test, QuestionDto qDto) {
        Question q = Question.builder()
                .test(test)
                .questionType(qDto.getQuestionType())
                .questionOrder(qDto.getQuestionOrder() != null ? qDto.getQuestionOrder() : 1)
                .marks(qDto.getMarks() != null ? qDto.getMarks() : 1)
                .title(qDto.getTitle() != null ? qDto.getTitle() : "Question")
                .problemStatement(qDto.getProblemStatement())
                .build();
        Question savedQ = questionRepository.save(q);

        if (qDto.getQuestionType() == QuestionType.MCQ && qDto.getOptions() != null) {
            for (McqOptionDto oDto : qDto.getOptions()) {
                McqOption opt = McqOption.builder()
                        .question(savedQ)
                        .optionKey(oDto.getOptionKey())
                        .optionText(oDto.getOptionText())
                        .correct(oDto.getIsCorrect() != null ? oDto.getIsCorrect() : false)
                        .build();
                mcqOptionRepository.save(opt);
            }
        } else if (qDto.getQuestionType() == QuestionType.CODING && qDto.getCodingQuestion() != null) {
            CodingQuestionDto cqDto = qDto.getCodingQuestion();
            CodingQuestion cq = CodingQuestion.builder()
                    .question(savedQ)
                    .inputFormat(cqDto.getInputFormat())
                    .outputFormat(cqDto.getOutputFormat())
                    .constraints(cqDto.getConstraints())
                    .sampleInput(cqDto.getSampleInput())
                    .sampleOutput(cqDto.getSampleOutput())
                    .language(cqDto.getLanguage() != null ? cqDto.getLanguage() : "java")
                    .defaultTemplate(cqDto.getDefaultTemplate())
                    .build();
            CodingQuestion savedCq = codingQuestionRepository.save(cq);

            if (cqDto.getTestCases() != null) {
                for (TestCaseDto tcDto : cqDto.getTestCases()) {
                    TestCase tc = TestCase.builder()
                            .codingQuestion(savedCq)
                            .inputData(tcDto.getInputData())
                            .expectedOutput(tcDto.getExpectedOutput())
                            .hidden(tcDto.getIsHidden() != null ? tcDto.getIsHidden() : true)
                            .testCaseOrder(tcDto.getTestCaseOrder() != null ? tcDto.getTestCaseOrder() : 1)
                            .build();
                    testCaseRepository.save(tc);
                }
            }
        }
    }

    private TestDto mapToSummaryDto(Test test) {
        int qCount = questionRepository.findAllByTestIdOrderByQuestionOrderAsc(test.getId()).size();
        return TestDto.builder()
                .id(test.getId())
                .title(test.getTitle())
                .description(test.getDescription())
                .durationMinutes(test.getDurationMinutes())
                .startTime(test.getStartTime())
                .endTime(test.getEndTime())
                .maxAttempts(test.getMaxAttempts())
                .active(test.getActive())
                .totalMarks(test.getTotalMarks())
                .questionCount(qCount)
                .createdAt(test.getCreatedAt())
                .build();
    }

    public TestDto mapToStudentTestDto(Test test) {
        List<Question> questions = questionRepository.findAllByTestIdOrderByQuestionOrderAsc(test.getId());
        List<QuestionDto> questionDtos = new ArrayList<>();

        for (Question q : questions) {
            QuestionDto qDto = QuestionDto.builder()
                    .id(q.getId())
                    .testId(test.getId())
                    .questionType(q.getQuestionType())
                    .questionOrder(q.getQuestionOrder())
                    .marks(q.getMarks())
                    .title(q.getTitle())
                    .problemStatement(q.getProblemStatement())
                    .build();

            if (q.getQuestionType() == QuestionType.MCQ) {
                // IMPORTANT: NEVER expose isCorrect to student!
                List<McqOptionDto> optionDtos = mcqOptionRepository.findAllByQuestionIdOrderByOptionKeyAsc(q.getId()).stream()
                        .map(o -> McqOptionDto.builder()
                                .id(o.getId())
                                .optionKey(o.getOptionKey())
                                .optionText(o.getOptionText())
                                .isCorrect(null) // stripped out!
                                .build())
                        .collect(Collectors.toList());
                qDto.setOptions(optionDtos);
            } else if (q.getQuestionType() == QuestionType.CODING) {
                codingQuestionRepository.findByQuestionId(q.getId()).ifPresent(cq -> {
                    // IMPORTANT: ONLY include sample test cases (hidden = false), NEVER hidden test cases!
                    List<TestCaseDto> sampleTestCases = testCaseRepository
                            .findAllByCodingQuestionIdAndHiddenFalseOrderByTestCaseOrderAsc(cq.getId()).stream()
                            .map(tc -> TestCaseDto.builder()
                                    .id(tc.getId())
                                    .inputData(tc.getInputData())
                                    .expectedOutput(tc.getExpectedOutput())
                                    .isHidden(false)
                                    .testCaseOrder(tc.getTestCaseOrder())
                                    .build())
                            .collect(Collectors.toList());

                    CodingQuestionDto cqDto = CodingQuestionDto.builder()
                            .id(cq.getId())
                            .inputFormat(cq.getInputFormat())
                            .outputFormat(cq.getOutputFormat())
                            .constraints(cq.getConstraints())
                            .sampleInput(cq.getSampleInput())
                            .sampleOutput(cq.getSampleOutput())
                            .language(cq.getLanguage())
                            .defaultTemplate(cq.getDefaultTemplate())
                            .testCases(sampleTestCases)
                            .build();
                    qDto.setCodingQuestion(cqDto);
                });
            }
            questionDtos.add(qDto);
        }

        return TestDto.builder()
                .id(test.getId())
                .title(test.getTitle())
                .description(test.getDescription())
                .durationMinutes(test.getDurationMinutes())
                .startTime(test.getStartTime())
                .endTime(test.getEndTime())
                .maxAttempts(test.getMaxAttempts())
                .active(test.getActive())
                .totalMarks(test.getTotalMarks())
                .questionCount(questionDtos.size())
                .questions(questionDtos)
                .build();
    }

    public TestDto mapToAdminTestDto(Test test) {
        List<Question> questions = questionRepository.findAllByTestIdOrderByQuestionOrderAsc(test.getId());
        List<QuestionDto> questionDtos = new ArrayList<>();

        for (Question q : questions) {
            QuestionDto qDto = QuestionDto.builder()
                    .id(q.getId())
                    .testId(test.getId())
                    .questionType(q.getQuestionType())
                    .questionOrder(q.getQuestionOrder())
                    .marks(q.getMarks())
                    .title(q.getTitle())
                    .problemStatement(q.getProblemStatement())
                    .build();

            if (q.getQuestionType() == QuestionType.MCQ) {
                List<McqOptionDto> optionDtos = mcqOptionRepository.findAllByQuestionIdOrderByOptionKeyAsc(q.getId()).stream()
                        .map(o -> McqOptionDto.builder()
                                .id(o.getId())
                                .optionKey(o.getOptionKey())
                                .optionText(o.getOptionText())
                                .isCorrect(o.getCorrect()) // Admin CAN see isCorrect
                                .build())
                        .collect(Collectors.toList());
                qDto.setOptions(optionDtos);
            } else if (q.getQuestionType() == QuestionType.CODING) {
                codingQuestionRepository.findByQuestionId(q.getId()).ifPresent(cq -> {
                    List<TestCaseDto> allTestCases = testCaseRepository
                            .findAllByCodingQuestionIdOrderByTestCaseOrderAsc(cq.getId()).stream()
                            .map(tc -> TestCaseDto.builder()
                                    .id(tc.getId())
                                    .inputData(tc.getInputData())
                                    .expectedOutput(tc.getExpectedOutput())
                                    .isHidden(tc.getHidden()) // Admin CAN see hidden test cases
                                    .testCaseOrder(tc.getTestCaseOrder())
                                    .build())
                            .collect(Collectors.toList());

                    CodingQuestionDto cqDto = CodingQuestionDto.builder()
                            .id(cq.getId())
                            .inputFormat(cq.getInputFormat())
                            .outputFormat(cq.getOutputFormat())
                            .constraints(cq.getConstraints())
                            .sampleInput(cq.getSampleInput())
                            .sampleOutput(cq.getSampleOutput())
                            .language(cq.getLanguage())
                            .defaultTemplate(cq.getDefaultTemplate())
                            .testCases(allTestCases)
                            .build();
                    qDto.setCodingQuestion(cqDto);
                });
            }
            questionDtos.add(qDto);
        }

        return TestDto.builder()
                .id(test.getId())
                .title(test.getTitle())
                .description(test.getDescription())
                .durationMinutes(test.getDurationMinutes())
                .startTime(test.getStartTime())
                .endTime(test.getEndTime())
                .maxAttempts(test.getMaxAttempts())
                .active(test.getActive())
                .totalMarks(test.getTotalMarks())
                .questionCount(questionDtos.size())
                .questions(questionDtos)
                .createdAt(test.getCreatedAt())
                .build();
    }
}
