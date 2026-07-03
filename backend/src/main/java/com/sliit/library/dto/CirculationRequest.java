package com.sliit.library.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CirculationRequest {

    @NotBlank(message = "Book accession number is required")
    private String accessionNumber;

    @NotBlank(message = "User ID is required")
    private String userId;

    private Long reservationId;

    private String notes;
}
