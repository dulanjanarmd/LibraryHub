package com.sliit.library.service;

import com.sliit.library.dto.AuthRequest;
import com.sliit.library.dto.AuthResponse;
import com.sliit.library.dto.RegisterRequest;
import com.sliit.library.entity.User;
import com.sliit.library.entity.enums.UserRole;
import com.sliit.library.exception.LibraryException;
import com.sliit.library.repository.UserRepository;
import com.sliit.library.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUserId(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (BadCredentialsException e) {
            throw LibraryException.unauthorized("Invalid user ID or password");
        }

        User user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> LibraryException.notFound("User", request.getUserId()));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(
                new org.springframework.security.core.userdetails.User(
                        user.getUserId(), user.getPasswordHash(), java.util.Collections.emptyList()
                )
        );
        String refreshToken = jwtUtil.generateRefreshToken(
                new org.springframework.security.core.userdetails.User(
                        user.getUserId(), user.getPasswordHash(), java.util.Collections.emptyList()
                )
        );

        log.info("User {} logged in successfully", user.getUserId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirationTime())
                .role(user.getRole())
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .build();
    }

    @Transactional
    public AuthResponse registerStudent(RegisterRequest request) {
        if (userRepository.existsByUserId(request.getUserId())) {
            throw LibraryException.conflict("User ID already exists: " + request.getUserId());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw LibraryException.conflict("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .userId(request.getUserId())
                .email(request.getEmail())
                .passwordHash(encodePassword(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .faculty(request.getFaculty())
                .programme(request.getProgramme())
                .role(UserRole.STUDENT)
                .isActive(true)
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        log.info("New student registered: {}", user.getUserId());

        // Auto login after registration
        String token = jwtUtil.generateToken(
                new org.springframework.security.core.userdetails.User(
                        user.getUserId(), user.getPasswordHash(), java.util.Collections.emptyList()
                )
        );
        String refreshToken = jwtUtil.generateRefreshToken(
                new org.springframework.security.core.userdetails.User(
                        user.getUserId(), user.getPasswordHash(), java.util.Collections.emptyList()
                )
        );
        
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirationTime())
                .role(user.getRole())
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .build();
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw LibraryException.unauthorized("No authenticated user");
        }
        String userId = authentication.getName();
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> LibraryException.notFound("User", userId));
    }

    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
}
