package com.assessment.quiz;

import com.assessment.quiz.dto.AuthRequest;
import com.assessment.quiz.dto.AuthResponse;
import com.assessment.quiz.dto.RegisterRequest;
import com.assessment.quiz.entity.Role;
import com.assessment.quiz.entity.StudentProfile;
import com.assessment.quiz.entity.User;
import com.assessment.quiz.exception.BadRequestException;
import com.assessment.quiz.repository.StudentProfileRepository;
import com.assessment.quiz.repository.UserRepository;
import com.assessment.quiz.security.CustomUserDetails;
import com.assessment.quiz.security.JwtTokenProvider;
import com.assessment.quiz.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("student@assessment.com")
                .password("encoded_pass")
                .role(Role.STUDENT)
                .studentProfile(StudentProfile.builder()
                        .fullName("Rahul Kumar")
                        .rollNumber("12345")
                        .section("CSE-A")
                        .build())
                .build();
    }

    @Test
    void testRegister_Success() {
        RegisterRequest request = RegisterRequest.builder()
                .email("new@assessment.com")
                .password("Secret@123")
                .fullName("New Student")
                .rollNumber("999")
                .section("CSE-B")
                .build();

        when(userRepository.existsByEmail("new@assessment.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtTokenProvider.generateToken(anyLong(), anyString(), anyString())).thenReturn("mock_jwt");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock_jwt", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
        verify(studentProfileRepository, times(1)).save(any(StudentProfile.class));
    }

    @Test
    void testRegister_DuplicateEmail_ThrowsBadRequest() {
        RegisterRequest request = RegisterRequest.builder()
                .email("existing@assessment.com")
                .password("Secret@123")
                .fullName("Test")
                .rollNumber("111")
                .section("A")
                .build();

        when(userRepository.existsByEmail("existing@assessment.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        AuthRequest request = AuthRequest.builder()
                .email("student@assessment.com")
                .password("Password@123")
                .build();

        Authentication auth = mock(Authentication.class);
        CustomUserDetails userDetails = new CustomUserDetails(sampleUser);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtTokenProvider.generateToken(auth)).thenReturn("login_jwt");
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("login_jwt", response.getToken());
        assertEquals("Rahul Kumar", response.getFullName());
    }
}
