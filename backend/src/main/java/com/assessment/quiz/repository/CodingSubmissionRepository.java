package com.assessment.quiz.repository;

import com.assessment.quiz.entity.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, Long> {
    Optional<CodingSubmission> findTopByAttemptIdAndQuestionIdOrderBySubmittedAtDesc(Long attemptId, Long questionId);
    List<CodingSubmission> findAllByAttemptIdOrderBySubmittedAtDesc(Long attemptId);
}
