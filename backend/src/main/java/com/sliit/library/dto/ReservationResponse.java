package com.sliit.library.dto;

import com.sliit.library.entity.ReservationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReservationResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String studentStaffId;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String isbn;
    private ReservationStatus status;
    private Integer queuePosition;
    private LocalDateTime reservationDate;
    private LocalDateTime notificationDate;
    private LocalDateTime expiryDate;
    private LocalDateTime fulfilledDate;
}
