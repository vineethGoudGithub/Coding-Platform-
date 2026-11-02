package com.assessment.quiz.repository;

import com.assessment.quiz.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findAllByTestIdOrderByQuestionOrderAsc(Long testId);
}
