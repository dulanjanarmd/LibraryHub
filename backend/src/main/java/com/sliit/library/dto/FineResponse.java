package com.sliit.library.dto;

import com.sliit.library.entity.FineStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FineResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String studentStaffId;
    private Long bookId;
    private String bookTitle;
    private Double amount;
    private Double paidAmount;
    private Double waivedAmount;
    private Double remainingAmount;
    private FineStatus status;
    private Integer overdueDays;
    private LocalDate fineDate;
    private String description;
    private String waiverReason;
    private LocalDateTime createdAt;
}
