package com.sliit.library.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReservationRequest {

    @NotNull
    private Long bookId;

    @NotNull
    private Long userId;
}
