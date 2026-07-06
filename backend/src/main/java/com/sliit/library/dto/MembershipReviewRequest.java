package com.sliit.library.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MembershipReviewRequest {

 private Boolean approved;

 @Size(max = 1000)
 private String adminComments;
}
