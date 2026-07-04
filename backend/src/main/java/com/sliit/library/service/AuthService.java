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

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Collections;

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
                                        new UsernamePasswordAuthenticationToken(request.getUserId(),
                                                        request.getPassword()));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (BadCredentialsException e) {
                        throw LibraryException.unauthorized("Invalid user ID or password");
                }

                User user = userRepository.findByUserId(request.getUserId())
                                .orElseThrow(() -> LibraryException.notFound("User", request.getUserId()));

                if (!isLoginRoleAllowed(request.getRole(), user.getRole())) {
                        throw LibraryException.unauthorized("This login form is for "
                                        + getFriendlyRoleName(request.getRole()) + " accounts.");
                }

                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);

                String token = jwtUtil.generateToken(
                                new org.springframework.security.core.userdetails.User(
                                                user.getUserId(), user.getPasswordHash(),
                                                Collections.emptyList()));
                String refreshToken = jwtUtil.generateRefreshToken(
                                new org.springframework.security.core.userdetails.User(
                                                user.getUserId(), user.getPasswordHash(),
                                                Collections.emptyList()));

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
                                .isMember(Boolean.TRUE.equals(user.getIsMember()))
                                .membershipId(user.getMembershipId())
                                .membershipStatus(user.getMembershipStatus())
                                .build();
        }

        @Transactional
        public AuthResponse registerUser(RegisterRequest request) {
                if (request.getUserId() == null || request.getUserId().isBlank()) {
                        throw LibraryException.validation("User ID is required");
                }
                if (request.getEmail() == null || request.getEmail().isBlank()) {
                        throw LibraryException.validation("Email is required");
                }
                if (request.getPassword() == null || request.getPassword().length() < 6) {
                        throw LibraryException.validation("Password must be at least 6 characters");
                }
                if (userRepository.existsByUserId(request.getUserId())) {
                        throw LibraryException.conflict("User ID already exists: " + request.getUserId());
                }
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw LibraryException.conflict("Email already registered: " + request.getEmail());
                }

                // Determine role from request (default to UNDERGRADUATE/student)
                UserRole role = UserRole.UNDERGRADUATE;
                if (request.getRole() != null) {
                        String r = request.getRole().trim().toLowerCase();
                        if (r.equals("faculty") || r.equals("staff")) {
                                role = UserRole.FACULTY;
                        } else if (r.equals("librarian") || r.equals("admin")) {
                                throw LibraryException.validation(
                                                "Librarian and admin accounts cannot self-register. Please use your assigned database credentials to login.");
                        }
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
                                .role(role)
                                .isActive(true)
                                .emailVerified(false)
                                .build();

                user = userRepository.save(user);
                log.info("New user registered: {} ({})", user.getUserId(), user.getRole());

                String token = jwtUtil.generateToken(
                                new org.springframework.security.core.userdetails.User(
                                                user.getUserId(), user.getPasswordHash(),
                                                Collections.emptyList()));
                String refreshToken = jwtUtil.generateRefreshToken(
                                new org.springframework.security.core.userdetails.User(
                                                user.getUserId(), user.getPasswordHash(),
                                                Collections.emptyList()));

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

        @Transactional
        public String requestPasswordReset(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> LibraryException.notFound("User", email));

                String temporaryPassword = generateTemporaryPassword();
                user.setPasswordHash(encodePassword(temporaryPassword));
                userRepository.save(user);

                log.info("Temporary password generated for user {}", user.getUserId());
                return temporaryPassword;
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

        private boolean isLoginRoleAllowed(String requestedRole, UserRole actualRole) {
                if (requestedRole == null || requestedRole.isBlank()) {
                        return true;
                }
                String normalized = requestedRole.trim().toLowerCase();
                return switch (normalized) {
                        case "student", "undergraduate", "postgraduate" ->
                                actualRole == UserRole.UNDERGRADUATE || actualRole == UserRole.POSTGRADUATE;
                        case "faculty", "staff" -> actualRole == UserRole.FACULTY;
                        case "librarian" -> actualRole == UserRole.LIBRARIAN;
                        case "admin" -> actualRole == UserRole.ADMIN;
                        default -> false;
                };
        }

        private String getFriendlyRoleName(String role) {
                if (role == null || role.isBlank()) {
                        return "student";
                }
                return switch (role.trim().toLowerCase()) {
                        case "faculty", "staff" -> "faculty member";
                        case "librarian" -> "librarian";
                        case "admin" -> "admin";
                        default -> "student";
                };
        }

        private String generateTemporaryPassword() {
                SecureRandom random = new SecureRandom();
                String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                StringBuilder password = new StringBuilder();
                for (int i = 0; i < 10; i++) {
                        password.append(chars.charAt(random.nextInt(chars.length())));
                }
                return password.toString();
        }
}
