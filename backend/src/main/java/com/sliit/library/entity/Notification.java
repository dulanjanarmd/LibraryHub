package com.sliit.library.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false)
    private DeliveryStatus deliveryStatus;

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_loan_id")
    private Loan relatedLoan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_book_id")
    private Book relatedBook;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        DUE_DATE, OVERDUE, RESERVATION_AVAILABLE, FINE_REMINDER, ANNOUNCEMENT, LOAN_CONFIRMATION, RETURN_CONFIRMATION
    }

    public enum NotificationChannel {
        EMAIL, SMS, IN_APP
    }

    public enum DeliveryStatus {
        PENDING, SENT, DELIVERED, FAILED, BOUNCED
    }

    @PrePersist
    public void prePersist() {
        if (this.isRead == null) this.isRead = false;
        if (this.deliveryStatus == null) this.deliveryStatus = DeliveryStatus.PENDING;
        if (this.retryCount == null) this.retryCount = 0;
    }
}
