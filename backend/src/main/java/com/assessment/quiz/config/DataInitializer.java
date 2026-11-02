package com.assessment.quiz.config;

import com.assessment.quiz.entity.Role;
import com.assessment.quiz.entity.StudentProfile;
import com.assessment.quiz.entity.User;
import com.assessment.quiz.repository.StudentProfileRepository;
import com.assessment.quiz.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@assessment.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdminUser();
        seedSampleStudent();
    }

    private void seedAdminUser() {
        String email = adminEmail.trim().toLowerCase();
        if (!userRepository.existsByEmail(email)) {
            User admin = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            logger.info("Admin account seeded successfully: email={}", email);
        } else {
            logger.info("Admin account already exists: email={}", email);
        }
    }

    private void seedSampleStudent() {
        String studentEmail = "student@assessment.com";
        if (!userRepository.existsByEmail(studentEmail)) {
            User student = User.builder()
                    .email(studentEmail)
                    .password(passwordEncoder.encode("Student@123"))
                    .role(Role.STUDENT)
                    .build();
            User savedStudent = userRepository.save(student);

            StudentProfile profile = StudentProfile.builder()
                    .user(savedStudent)
                    .fullName("Rahul Kumar")
                    .rollNumber("12345")
                    .section("CSE-A")
                    .build();
            studentProfileRepository.save(profile);
            savedStudent.setStudentProfile(profile);

            logger.info("Sample student seeded successfully: email={}, name='Rahul Kumar'", studentEmail);
        }
    }
}
