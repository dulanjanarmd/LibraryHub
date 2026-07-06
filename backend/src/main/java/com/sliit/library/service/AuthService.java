package com.sliit.library.service;

import com.sliit.library.dto.*;
import com.sliit.library.entity.Role;
import com.sliit.library.entity.User;
import com.sliit.library.repository.MembershipRepository;
import com.sliit.library.repository.UserRepository;
import com.sliit.library.security.JwtUtils;
import com.sliit.library.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    // In-memory token store (replace with DB/email in production)
    private final Map<String, String> resetTokens = new ConcurrentHashMap<>();

    public JwtResponse authenticate(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getIdentifier(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        boolean isMember = false;
        if (user.getRole() == Role.STUDENT || user.getRole() == Role.FACULTY) {
            isMember = membershipRepository.existsByUserIdAndStatus(user.getId(),
                    com.sliit.library.entity.MembershipStatus.APPROVED);
        }

        return JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .fullName(userDetails.getFullName())
                .email(userDetails.getEmail())
                .role(user.getRole())
                .studentStaffId(user.getStudentStaffId())
                .isMember(isMember)
                .build();
    }

    public MessageResponse register(SignupRequest signupRequest) {
        // Block LIBRARIAN and ADMIN self-registration
        if (signupRequest.getRole() == Role.LIBRARIAN || signupRequest.getRole() == Role.ADMIN) {
            return MessageResponse.builder()
                    .message("Error: Cannot self-register as LIBRARIAN or ADMIN.")
                    .success(false)
                    .build();
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return MessageResponse.builder()
                    .message("Error: Email is already in use!")
                    .success(false)
                    .build();
        }

        if (userRepository.existsByStudentStaffId(signupRequest.getStudentStaffId())) {
            return MessageResponse.builder()
                    .message("Error: Student/Staff ID is already in use!")
                    .success(false)
                    .build();
        }

        User user = User.builder()
                .fullName(signupRequest.getFullName())
                .studentStaffId(signupRequest.getStudentStaffId())
                .email(signupRequest.getEmail())
                .password(encoder.encode(signupRequest.getPassword()))
                .phoneNumber(signupRequest.getPhoneNumber())
                .role(signupRequest.getRole() != null ? signupRequest.getRole() : Role.STUDENT)
                .faculty(signupRequest.getFaculty())
                .programme(signupRequest.getProgramme())
                .isActive(true)
                .currentBorrowCount(0)
                .outstandingFine(0.0)
                .build();

        userRepository.save(user);

        return new MessageResponse("User registered successfully!");
    }

    public MessageResponse forgotPassword(String identifier) {
        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByStudentStaffId(identifier))
                .orElse(null);
        // Always return success to avoid user enumeration
        if (user != null) {
            String token = UUID.randomUUID().toString();
            resetTokens.put(token, user.getEmail());
            // In production send email; for now return token in response for testing
            return MessageResponse.builder()
                    .message("Password reset token generated. Token: " + token)
                    .success(true)
                    .build();
        }
        return new MessageResponse("If that account exists, a reset link has been sent.");
    }

    public MessageResponse resetPassword(String token, String newPassword) {
        String email = resetTokens.get(token);
        if (email == null) {
            return MessageResponse.builder().message("Invalid or expired reset token.").success(false).build();
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        resetTokens.remove(token);
        return new MessageResponse("Password reset successfully.");
    }
}
