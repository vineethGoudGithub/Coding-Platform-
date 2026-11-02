package com.assessment.quiz.repository;

import com.assessment.quiz.entity.McqOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface McqOptionRepository extends JpaRepository<McqOption, Long> {
    List<McqOption> findAllByQuestionIdOrderByOptionKeyAsc(Long questionId);
}
