package com.sliit.library.entity;

import com.sliit.library.entity.enums.ReservationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "queue_position", nullable = false)
    private Integer queuePosition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;

    @Column(name = "available_date")
    private LocalDateTime availableDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "fulfilled_date")
    private LocalDateTime fulfilledDate;

    @Column(name = "cancelled_date")
    private LocalDateTime cancelledDate;

    @Column(name = "cancel_reason", length = 255)
    private String cancelReason;

    @Column(name = "notified", nullable = false)
    private Boolean notified;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.queuePosition == null) this.queuePosition = 1;
        if (this.status == null) this.status = ReservationStatus.PENDING;
        if (this.notified == null) this.notified = false;
        if (this.requestDate == null) this.requestDate = LocalDateTime.now();
    }
}
