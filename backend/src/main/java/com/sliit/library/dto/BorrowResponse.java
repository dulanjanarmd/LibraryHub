package com.sliit.library.dto;

import com.sliit.library.entity.BorrowStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BorrowResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String studentStaffId;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String isbn;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private BorrowStatus status;
    private Integer renewalCount;
    private Double fineAmount;
    private String issuedByName;
    private LocalDateTime createdAt;
}
