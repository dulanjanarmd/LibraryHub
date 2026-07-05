package com.sliit.library.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class OverdueItemDTO {

    private Long borrowId;
    private Long userId;
    private String userName;
    private String studentStaffId;
    private String email;
    private String phoneNumber;
    private Long bookId;
    private String bookTitle;
    private String isbn;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private Integer overdueDays;
    private Double fineAmount;
}
