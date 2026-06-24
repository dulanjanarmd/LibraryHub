package com.sliit.library.service;

import com.sliit.library.dto.ReservationDTO;
import com.sliit.library.entity.Book;
import com.sliit.library.entity.Reservation;
import com.sliit.library.entity.User;
import com.sliit.library.entity.enums.ReservationStatus;
import com.sliit.library.exception.LibraryException;
import com.sliit.library.repository.BookRepository;
import com.sliit.library.repository.ReservationRepository;
import com.sliit.library.repository.SystemConfigRepository;
import com.sliit.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final SystemConfigRepository configRepository;

    @Transactional(readOnly = true)
    public List<ReservationDTO> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationDTO> getUserPendingReservations(Long userId) {
        return reservationRepository.findByUserIdAndStatus(userId, ReservationStatus.PENDING).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservationDTO createReservation(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> LibraryException.notFound("User", userId.toString()));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> LibraryException.notFound("Book", bookId.toString()));

        // Check max reservations per user
        int maxReservations = Integer.parseInt(configRepository.findByConfigKey("reservation.max_per_user")
                .map(c -> c.getConfigValue()).orElse("3"));
        long currentReservations = reservationRepository.countPendingByUser(userId);
        if (currentReservations >= maxReservations) {
            throw LibraryException.validation("Maximum " + maxReservations + " simultaneous reservations allowed");
        }

        // Check if book has available copies
        if (book.getAvailableCopies() > 0) {
            throw LibraryException.validation("Book has available copies. Please borrow directly.");
        }

        // Check if user already reserved this book
        boolean alreadyReserved = reservationRepository.findByUserId(userId).stream()
                .anyMatch(r -> r.getBook().getId().equals(bookId) && r.getStatus() == ReservationStatus.PENDING);
        if (alreadyReserved) {
            throw LibraryException.conflict("You have already reserved this book");
        }

        Integer queuePosition = reservationRepository.findMaxQueuePosition(bookId);
        if (queuePosition == null) queuePosition = 0;
        queuePosition++;

        Reservation reservation = Reservation.builder()
                .user(user)
                .book(book)
                .queuePosition(queuePosition)
                .status(ReservationStatus.PENDING)
                .build();

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation created: {} for book {} (Queue position: {})",
                saved.getId(), book.getTitle(), queuePosition);
        return mapToDTO(saved);
    }

    @Transactional
    public ReservationDTO cancelReservation(Long reservationId, Long userId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> LibraryException.notFound("Reservation", reservationId.toString()));

        if (!reservation.getUser().getId().equals(userId)) {
            throw LibraryException.forbidden("You can only cancel your own reservations");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING && reservation.getStatus() != ReservationStatus.AVAILABLE) {
            throw LibraryException.validation("Reservation cannot be cancelled in status: " + reservation.getStatus());
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancelledDate(LocalDateTime.now());
        reservation.setCancelReason(reason);

        // Reorder queue positions
        List<Reservation> queue = reservationRepository.findByBookIdAndStatusOrderByQueuePositionAsc(
                reservation.getBook().getId(), ReservationStatus.PENDING);
        int removedPosition = reservation.getQueuePosition();
        for (Reservation r : queue) {
            if (r.getQueuePosition() > removedPosition) {
                r.setQueuePosition(r.getQueuePosition() - 1);
                reservationRepository.save(r);
            }
        }

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation {} cancelled by user {}", reservationId, userId);
        return mapToDTO(saved);
    }

    private ReservationDTO mapToDTO(Reservation r) {
        return ReservationDTO.builder()
                .id(r.getId())
                .userId(r.getUser() != null ? r.getUser().getId() : null)
                .userName(r.getUser() != null ? r.getUser().getFullName() : null)
                .bookId(r.getBook() != null ? r.getBook().getId() : null)
                .bookTitle(r.getBook() != null ? r.getBook().getTitle() : null)
                .bookAuthor(r.getBook() != null ? r.getBook().getAuthor() : null)
                .queuePosition(r.getQueuePosition())
                .status(r.getStatus())
                .requestDate(r.getRequestDate())
                .availableDate(r.getAvailableDate())
                .expiryDate(r.getExpiryDate())
                .cancelReason(r.getCancelReason())
                .notified(r.getNotified())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
