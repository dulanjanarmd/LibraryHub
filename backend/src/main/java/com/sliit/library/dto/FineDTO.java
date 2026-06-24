package com.sliit.library.dto;

import com.sliit.library.entity.enums.FineType;
import com.sliit.library.entity.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FineDTO {

    private Long id;
    private Long loanId;
    private Long userId;
    private String userName;
    private BigDecimal amountLkr;
    private BigDecimal paidAmountLkr;
    private BigDecimal balanceLkr;
    private FineType fineType;
    private Integer daysOverdue;
    private BigDecimal ratePerDay;
    private Boolean isPaid;
    private LocalDateTime paymentDate;
    private PaymentMethod paymentMethod;
    private String receiptNumber;
    private String waiverReason;
    private String waivedByName;
    private LocalDateTime waivedAt;
    private LocalDateTime createdAt;
}
