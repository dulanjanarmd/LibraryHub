package com.sliit.library.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PaymentRequest {

    @NotNull
    private Long fineId;

    @NotNull
    @Positive
    private Double amount;

    private String paymentMethod;
}
