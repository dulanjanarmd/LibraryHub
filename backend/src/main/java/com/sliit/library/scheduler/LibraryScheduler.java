package com.sliit.library.scheduler;

import com.sliit.library.entity.*;
import com.sliit.library.repository.*;
import com.sliit.library.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
public class LibraryScheduler {

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void sendDueDateReminders() {
        log.info("Running due date reminder job...");
        LocalDate today = LocalDate.now();
        LocalDate in3Days = today.plusDays(3);
        LocalDate tomorrow = today.plusDays(1);

        List<BorrowRecord> activeLoans = borrowRecordRepository.findByStatus(BorrowStatus.ACTIVE);

        for (BorrowRecord record : activeLoans) {
            LocalDate dueDate = record.getDueDate();
            User user = record.getUser();
            Book book = record.getBook();

            if (dueDate.equals(tomorrow)) {
                notificationService.sendNotification(
                        user,
                        NotificationType.DUE_REMINDER,
                        "Due Tomorrow: " + book.getTitle(),
                        "Your borrowed book \"" + book.getTitle() + "\" is due tomorrow (" + dueDate + "). Please return or renew it."
                );
            } else if (dueDate.equals(in3Days)) {
                notificationService.sendNotification(
                        user,
                        NotificationType.DUE_REMINDER,
                        "Due in 3 Days: " + book.getTitle(),
                        "Your borrowed book \"" + book.getTitle() + "\" is due in 3 days (" + dueDate + ")."
                );
            }
        }

        log.info("Due date reminders sent.");
    }

    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void sendOverdueNotifications() {
        log.info("Running overdue notification job...");
        LocalDate today = LocalDate.now();

        List<BorrowRecord> overdueLoans = borrowRecordRepository.findOverdueLoans(today);

        for (BorrowRecord record : overdueLoans) {
            long overdueDays = ChronoUnit.DAYS.between(record.getDueDate(), today);
            User user = record.getUser();
            Book book = record.getBook();
            double fine = overdueDays * 5.0;

            notificationService.sendNotification(
                    user,
                    NotificationType.OVERDUE_ALERT,
                    "OVERDUE: " + book.getTitle(),
                    "Your book \"" + book.getTitle() + "\" is " + overdueDays + " days overdue. " +
                            "Accumulated fine: LKR " + String.format("%.2f", fine) + ". Please return it immediately."
            );
        }

        log.info("Overdue notifications sent for {} loans.", overdueLoans.size());
    }

    @Scheduled(cron = "0 0 * * * ?")
    @Transactional
    public void expireOldReservations() {
        log.info("Running reservation expiry job...");
        LocalDateTime now = LocalDateTime.now();

        List<Reservation> expired = reservationRepository.findExpiredNotified(now);

        for (Reservation reservation : expired) {
            reservation.setStatus(ReservationStatus.EXPIRED);
            reservationRepository.save(reservation);

            Book book = reservation.getBook();
            book.setReservedCopies(Math.max(0, book.getReservedCopies() - 1));

            if (book.getAvailableCopies() > 0 && book.getStatus() == BookStatus.RESERVED) {
                book.setStatus(BookStatus.AVAILABLE);
            }

            bookRepository.save(book);

            notificationService.sendNotification(
                    reservation.getUser(),
                    NotificationType.RESERVATION_READY,
                    "Reservation Expired: " + book.getTitle(),
                    "Your reservation for \"" + book.getTitle() + "\" has expired. The book has been released to the next person in queue."
            );
        }

        log.info("Expired {} reservations.", expired.size());
    }
}
