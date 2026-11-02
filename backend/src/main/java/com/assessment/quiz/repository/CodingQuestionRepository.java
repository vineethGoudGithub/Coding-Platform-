package com.assessment.quiz.repository;

import com.assessment.quiz.entity.CodingQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodingQuestionRepository extends JpaRepository<CodingQuestion, Long> {
    Optional<CodingQuestion> findByQuestionId(Long questionId);
}
