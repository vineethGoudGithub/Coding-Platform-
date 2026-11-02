package com.assessment.quiz.service;

import com.assessment.quiz.dto.AuthRequest;
import com.assessment.quiz.dto.AuthResponse;
import com.assessment.quiz.dto.CandidateEntryRequest;
import com.assessment.quiz.dto.RegisterRequest;
import com.assessment.quiz.dto.UserDto;
import com.assessment.quiz.entity.Role;
import com.assessment.quiz.entity.StudentProfile;
import com.assessment.quiz.entity.User;
import com.assessment.quiz.exception.BadRequestException;
import com.assessment.quiz.exception.ResourceNotFoundException;
import com.assessment.quiz.repository.StudentProfileRepository;
import com.assessment.quiz.repository.UserRepository;
import com.assessment.quiz.security.CustomUserDetails;
import com.assessment.quiz.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse login(AuthRequest request) {
        logger.info("Login attempt for email: {}", request.getEmail());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();
        String jwt = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String fullName = user.getEmail();
        String rollNumber = "";
        String section = "";

        if (user.getStudentProfile() != null) {
            fullName = user.getStudentProfile().getFullName();
            rollNumber = user.getStudentProfile().getRollNumber();
            section = user.getStudentProfile().getSection();
        }

        return AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(fullName)
                .rollNumber(rollNumber)
                .section(section)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered: " + email);
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();

        User savedUser = userRepository.save(user);

        StudentProfile profile = StudentProfile.builder()
                .user(savedUser)
                .fullName(request.getFullName().trim())
                .rollNumber(request.getRollNumber().trim())
                .section(request.getSection().trim())
                .build();

        studentProfileRepository.save(profile);
        savedUser.setStudentProfile(profile);

        String jwt = jwtTokenProvider.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());

        logger.info("New student registered successfully: {}", email);

        return AuthResponse.builder()
                .token(jwt)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .fullName(profile.getFullName())
                .rollNumber(profile.getRollNumber())
                .studentClass(profile.getStudentClass())
                .section(profile.getSection())
                .build();
    }

    @Transactional
    public AuthResponse candidateEntry(CandidateEntryRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .role(Role.STUDENT)
                    .build();
            user = userRepository.save(user);

            StudentProfile profile = StudentProfile.builder()
                    .user(user)
                    .fullName(request.getFullName().trim())
                    .studentClass(request.getStudentClass() != null ? request.getStudentClass().trim() : "")
                    .section(request.getSection().trim())
                    .rollNumber(request.getRollNumber() != null ? request.getRollNumber().trim() : "")
                    .build();
            studentProfileRepository.save(profile);
            user.setStudentProfile(profile);
        } else {
            StudentProfile profile = user.getStudentProfile();
            if (profile != null) {
                profile.setFullName(request.getFullName().trim());
                if (request.getStudentClass() != null) profile.setStudentClass(request.getStudentClass().trim());
                if (request.getSection() != null) profile.setSection(request.getSection().trim());
                if (request.getRollNumber() != null && !request.getRollNumber().isBlank()) {
                    profile.setRollNumber(request.getRollNumber().trim());
                }
                studentProfileRepository.save(profile);
            }
        }

        String jwt = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getStudentProfile() != null ? user.getStudentProfile().getFullName() : request.getFullName())
                .studentClass(user.getStudentProfile() != null ? user.getStudentProfile().getStudentClass() : request.getStudentClass())
                .section(user.getStudentProfile() != null ? user.getStudentProfile().getSection() : request.getSection())
                .rollNumber(user.getStudentProfile() != null ? user.getStudentProfile().getRollNumber() : request.getRollNumber())
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        StudentProfile profile = user.getStudentProfile();
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(profile != null ? profile.getFullName() : "Admin")
                .rollNumber(profile != null ? profile.getRollNumber() : "")
                .section(profile != null ? profile.getSection() : "")
                .build();
    }
}
