package com.assessment.quiz.repository;

import com.assessment.quiz.entity.AttemptStatus;
import com.assessment.quiz.entity.TestAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {

    Optional<TestAttempt> findFirstByTestIdAndStudentIdAndStatus(Long testId, Long studentId, AttemptStatus status);

    List<TestAttempt> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<TestAttempt> findAllByTestIdOrderByCreatedAtDesc(Long testId);

    long countByStatus(AttemptStatus status);

    @Query("SELECT COALESCE(AVG(a.totalScore), 0.0) FROM TestAttempt a WHERE a.status = 'SUBMITTED'")
    Double findAverageScore();

    @Query("SELECT a FROM TestAttempt a " +
           "JOIN a.student u " +
           "LEFT JOIN u.studentProfile p " +
           "JOIN a.test t " +
           "WHERE (:status IS NULL OR a.status = :status) " +
           "AND (:testId IS NULL OR t.id = :testId) " +
           "AND (:section IS NULL OR :section = '' OR p.section = :section) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(p.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(p.rollNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<TestAttempt> findFilteredAttempts(
            @Param("status") AttemptStatus status,
            @Param("testId") Long testId,
            @Param("section") String section,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT a FROM TestAttempt a " +
           "JOIN a.student u " +
           "LEFT JOIN u.studentProfile p " +
           "JOIN a.test t " +
           "WHERE a.status = 'SUBMITTED' " +
           "ORDER BY a.submittedAt DESC")
    List<TestAttempt> findTopResultsForExport();

    @Query("SELECT a FROM TestAttempt a WHERE a.status = 'IN_PROGRESS' AND a.endTime < :now")
    List<TestAttempt> findExpiredAttempts(@Param("now") LocalDateTime now);
}
