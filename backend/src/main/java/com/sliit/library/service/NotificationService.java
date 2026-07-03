package com.sliit.library.service;

import com.sliit.library.entity.Notification;
import com.sliit.library.entity.Reservation;
import com.sliit.library.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void sendReservationAvailableNotification(Reservation reservation) {
        String subject = "Your reserved book is now available";
        String message = String.format("Dear %s,\n\nThe book '%s' you reserved is now available for pickup. Please collect it before %s.\n\nThank you,\nSLIIT Library",
                reservation.getUser().getFirstName(),
                reservation.getBook().getTitle(),
                reservation.getExpiryDate());

        Notification notification = Notification.builder()
                .user(reservation.getUser())
                .type(Notification.NotificationType.RESERVATION_AVAILABLE)
                .channel(Notification.NotificationChannel.EMAIL)
                .subject(subject)
                .message(message)
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .deliveryStatus(Notification.DeliveryStatus.SENT) // Mocking as sent
                .retryCount(0)
                .relatedBook(reservation.getBook())
                .build();

        notificationRepository.save(notification);
        
        log.info("📧 MOCK EMAIL SENT to {}: {}", reservation.getUser().getEmail(), subject);
        log.info("Message body: {}", message);
    }
}
