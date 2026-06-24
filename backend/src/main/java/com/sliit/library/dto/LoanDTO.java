package com.sliit.library.dto;

import com.sliit.library.entity.enums.LoanStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanDTO {

    private Long id;
    private Long userId;
    private String userName;
    private Long bookCopyId;
    private String accessionNumber;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private LocalDateTime issueDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;
    private Integer renewalCount;
    private LoanStatus status;
    private Long issuedById;
    private String issuedByName;
    private Long daysOverdue;
    private Boolean canRenew;
    private LocalDateTime createdAt;
}
