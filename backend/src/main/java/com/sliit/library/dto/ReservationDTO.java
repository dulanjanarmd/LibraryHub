package com.sliit.library.dto;

import com.sliit.library.entity.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO {

    private Long id;
    private Long userId;
    private String userName;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private Integer queuePosition;
    private ReservationStatus status;
    private LocalDateTime requestDate;
    private LocalDateTime availableDate;
    private LocalDateTime expiryDate;
    private String cancelReason;
    private Boolean notified;
    private LocalDateTime createdAt;
}
