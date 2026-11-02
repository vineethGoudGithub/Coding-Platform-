package com.assessment.quiz.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 32)
    private QuestionType questionType;

    @Column(name = "question_order", nullable = false)
    @Builder.Default
    private Integer questionOrder = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer marks = 1;

    @Column(nullable = false)
    private String title;

    @Column(name = "problem_statement", nullable = false, columnDefinition = "TEXT")
    private String problemStatement;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("optionKey ASC")
    @Builder.Default
    private List<McqOption> options = new ArrayList<>();

    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private CodingQuestion codingQuestion;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public void addOption(McqOption option) {
        options.add(option);
        option.setQuestion(this);
    }

    public void setCodingQuestion(CodingQuestion codingQuestion) {
        this.codingQuestion = codingQuestion;
        if (codingQuestion != null) {
            codingQuestion.setQuestion(this);
        }
    }
}
