package com.assessment.quiz.repository;

import com.assessment.quiz.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findAllByAttemptIdOrderByCreatedAtAsc(Long attemptId);
}
