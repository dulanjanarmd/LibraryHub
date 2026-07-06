package com.sliit.library.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank
    private String identifier; // email or student/staff ID

    @NotBlank
    private String password;
}
