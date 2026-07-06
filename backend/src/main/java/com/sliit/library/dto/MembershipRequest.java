package com.sliit.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MembershipRequest {

 @NotBlank
 @Size(max = 100)
 private String faculty;

 @NotBlank
 @Size(max = 100)
 private String programme;

 @NotBlank
 @Size(max = 50)
 private String academicYear;

 @Size(max = 500)
 private String reason;
}
