package com.sliit.library.controller;

import com.sliit.library.dto.ApiResponse;
import com.sliit.library.dto.AuthRequest;
import com.sliit.library.dto.AuthResponse;
import com.sliit.library.dto.ForgotPasswordRequest;
import com.sliit.library.dto.RegisterRequest;
import com.sliit.library.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login and authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and get JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new student")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerUser(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Registration successful"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a temporary password reset for an existing account")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String temporaryPassword = authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(temporaryPassword, "Temporary password generated successfully"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT token")
    public ResponseEntity<ApiResponse<String>> refreshToken(@RequestHeader("X-Refresh-Token") String refreshToken) {
        // Implementation for token refresh
        return ResponseEntity.ok(ApiResponse.success("New token", "Token refreshed"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user info")
    public ResponseEntity<ApiResponse<com.sliit.library.entity.User>> getCurrentUser() {
        var user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
