package com.sliit.library.service;

import com.sliit.library.dto.*;
import com.sliit.library.entity.Role;
import com.sliit.library.entity.User;
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

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    public JwtResponse authenticate(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        return JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .fullName(userDetails.getFullName())
                .email(userDetails.getEmail())
                .role(user.getRole())
                .studentStaffId(user.getStudentStaffId())
                .build();
    }

    public MessageResponse register(SignupRequest signupRequest) {
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
}
