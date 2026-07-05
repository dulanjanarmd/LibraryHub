package com.sliit.library.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 15)
    private String phoneNumber;

    private String faculty;
    private String programme;
    private String profileImageUrl;
}
