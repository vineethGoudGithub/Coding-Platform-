package com.assessment.quiz.repository;

import com.assessment.quiz.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findAllByCodingQuestionIdOrderByTestCaseOrderAsc(Long codingQuestionId);
    List<TestCase> findAllByCodingQuestionIdAndHiddenFalseOrderByTestCaseOrderAsc(Long codingQuestionId);
}
