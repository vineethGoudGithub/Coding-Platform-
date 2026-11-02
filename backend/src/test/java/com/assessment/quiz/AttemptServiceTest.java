package com.assessment.quiz;

import com.assessment.quiz.dto.SubmitAttemptResponse;
import com.assessment.quiz.entity.*;
import com.assessment.quiz.exception.BadRequestException;
import com.assessment.quiz.repository.*;
import com.assessment.quiz.service.AttemptService;
import com.assessment.quiz.service.TestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AttemptServiceTest {

    @Mock
    private TestRepository testRepository;
    @Mock
    private TestAttemptRepository testAttemptRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private McqOptionRepository mcqOptionRepository;
    @Mock
    private CodingQuestionRepository codingQuestionRepository;
    @Mock
    private StudentAnswerRepository studentAnswerRepository;
    @Mock
    private CodingSubmissionRepository codingSubmissionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private TestService testService;
    @Mock
    private StudentProfileRepository studentProfileRepository;

    @InjectMocks
    private AttemptService attemptService;

    private User student;
    private com.assessment.quiz.entity.Test testEntity;
    private TestAttempt inProgressAttempt;
    private TestAttempt alreadySubmittedAttempt;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(2L)
                .email("student@assessment.com")
                .role(Role.STUDENT)
                .studentProfile(StudentProfile.builder()
                        .fullName("Rahul Kumar")
                        .rollNumber("12345")
                        .section("CSE-A")
                        .build())
                .build();

        testEntity = com.assessment.quiz.entity.Test.builder()
                .id(1L)
                .title("Java Programming Assessment")
                .durationMinutes(45)
                .totalMarks(10)
                .active(true)
                .build();

        inProgressAttempt = TestAttempt.builder()
                .id(10L)
                .test(testEntity)
                .student(student)
                .status(AttemptStatus.IN_PROGRESS)
                .startTime(LocalDateTime.now().minusMinutes(10))
                .endTime(LocalDateTime.now().plusMinutes(35))
                .mcqScore(0)
                .codingScore(0)
                .totalScore(0)
                .percentage(0.0)
                .build();

        alreadySubmittedAttempt = TestAttempt.builder()
                .id(11L)
                .test(testEntity)
                .student(student)
                .status(AttemptStatus.SUBMITTED)
                .startTime(LocalDateTime.now().minusMinutes(40))
                .endTime(LocalDateTime.now().plusMinutes(5))
                .submittedAt(LocalDateTime.now().minusMinutes(10))
                .totalScore(9)
                .build();
    }

    @Test
    void testSubmitAttempt_DuplicateSubmissionThrowsBadRequest() {
        when(testAttemptRepository.findById(11L)).thenReturn(Optional.of(alreadySubmittedAttempt));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                attemptService.submitAttempt(11L, 2L)
        );

        assertTrue(ex.getMessage().contains("already been submitted"));
    }

    @Test
    void testSubmitAttempt_UnauthorizedStudentThrowsBadRequest() {
        when(testAttemptRepository.findById(10L)).thenReturn(Optional.of(inProgressAttempt));

        assertThrows(BadRequestException.class, () ->
                attemptService.submitAttempt(10L, 999L) // Wrong student ID
        );
    }

    @Test
    void testSubmitAttempt_CalculatesScoreAndCompletes() {
        when(testAttemptRepository.findById(10L)).thenReturn(Optional.of(inProgressAttempt));

        // Create sample MCQ question
        Question q1 = Question.builder()
                .id(1L)
                .test(testEntity)
                .questionType(QuestionType.MCQ)
                .questionOrder(1)
                .marks(1)
                .title("Primitive Data Types")
                .problemStatement("Which is NOT primitive?")
                .build();

        McqOption correctOpt = McqOption.builder().id(3L).question(q1).optionKey("C").optionText("String").correct(true).build();
        McqOption wrongOpt = McqOption.builder().id(1L).question(q1).optionKey("A").optionText("int").correct(false).build();

        StudentAnswer ans1 = StudentAnswer.builder()
                .id(100L)
                .attempt(inProgressAttempt)
                .question(q1)
                .selectedOption(correctOpt)
                .answered(true)
                .build();

        when(questionRepository.findAllByTestIdOrderByQuestionOrderAsc(1L)).thenReturn(List.of(q1));
        when(studentAnswerRepository.findAllByAttemptId(10L)).thenReturn(List.of(ans1));
        when(mcqOptionRepository.findAllByQuestionIdOrderByOptionKeyAsc(1L)).thenReturn(List.of(wrongOpt, correctOpt));

        SubmitAttemptResponse response = attemptService.submitAttempt(10L, 2L);

        assertNotNull(response);
        assertEquals(1, response.getMcqScore());
        assertEquals(0, response.getCodingScore());
        assertEquals(1, response.getTotalScore());
        assertEquals(1, response.getMaxTotalScore());
        assertEquals(100.0, response.getPercentage());
        assertEquals("PASSED", response.getStatus());
        assertEquals(AttemptStatus.SUBMITTED, inProgressAttempt.getStatus());
        verify(testAttemptRepository, times(1)).save(inProgressAttempt);
    }
}
