package com.assessment.quiz.repository;

import com.assessment.quiz.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {
    List<Test> findAllByActiveTrue();
    Optional<Test> findByIdAndActiveTrue(Long id);

    @Query("SELECT COUNT(t) FROM Test t WHERE t.active = true")
    long countActiveTests();
}
