package com.assessment.quiz.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mcq_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class McqOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "option_key", nullable = false, length = 8)
    private String optionKey; // 'A', 'B', 'C', 'D'

    @Column(name = "option_text", nullable = false, columnDefinition = "TEXT")
    private String optionText;

    @Column(name = "is_correct", nullable = false)
    @Builder.Default
    private Boolean correct = false;
}
