package com.sliit.library.service;

import com.sliit.library.dto.AuthRequest;
import com.sliit.library.entity.User;
import com.sliit.library.entity.enums.UserRole;
import com.sliit.library.repository.UserRepository;
import com.sliit.library.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void requestPasswordResetShouldGenerateTemporaryPasswordForExistingEmail() {
        User user = User.builder()
                .userId("IT20230001")
                .email("student@sliit.lk")
                .passwordHash("old-hash")
                .firstName("Ada")
                .lastName("Lovelace")
                .role(UserRole.UNDERGRADUATE)
                .isActive(true)
                .build();

        when(userRepository.findByEmail("student@sliit.lk")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(anyString())).thenAnswer(invocation -> "encoded:" + invocation.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String temporaryPassword = authService.requestPasswordReset("student@sliit.lk");

        assertThat(temporaryPassword).isNotBlank();
        assertThat(user.getPasswordHash()).startsWith("encoded:");
        verify(userRepository).save(user);
    }
}
