package com.sliit.library.dto;

import com.sliit.library.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String studentStaffId;
    private String email;
    private String phoneNumber;
    private Role role;
    private String faculty;
    private String programme;
    private String profileImageUrl;
    private Boolean isActive;
    private Integer currentBorrowCount;
    private Double outstandingFine;
    private LocalDateTime createdAt;
    private Integer maxBooksAllowed;
    private Integer maxDaysAllowed;
    private Boolean isMember;
    private String membershipId;
}
