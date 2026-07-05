package com.sliit.library.dto;

import com.sliit.library.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {

    private String token;
    private String type;
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String studentStaffId;
}
