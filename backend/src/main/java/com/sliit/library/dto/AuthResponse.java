package com.sliit.library.dto;

import com.sliit.library.entity.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private UserRole role;
    private String userId;
    private String fullName;
    private String email;
    private Boolean isMember;
    private String membershipId;
    private com.sliit.library.entity.enums.MembershipStatus membershipStatus;
}
