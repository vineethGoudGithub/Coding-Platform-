package com.assessment.quiz.repository;

import com.assessment.quiz.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    Optional<StudentAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
    List<StudentAnswer> findAllByAttemptId(Long attemptId);
}
