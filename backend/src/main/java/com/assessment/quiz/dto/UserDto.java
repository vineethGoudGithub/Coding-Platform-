package com.assessment.quiz.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String email;
    private String role;
    private String fullName;
    private String rollNumber;
    private String studentClass;
    private String section;
}
