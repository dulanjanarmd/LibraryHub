package com.sliit.library.service;

import com.sliit.library.dto.LoanDTO;
import com.sliit.library.entity.*;
import com.sliit.library.entity.enums.FineType;
import com.sliit.library.entity.enums.LoanStatus;
import com.sliit.library.entity.enums.ReservationStatus;
import com.sliit.library.exception.LibraryException;
import com.sliit.library.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;
    private final ReservationRepository reservationRepository;
    private final FineRepository fineRepository;
    private final SystemConfigRepository configRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<LoanDTO> getUserLoans(Long userId, LoanStatus status) {
        List<Loan> loans;
        if (status != null) {
            loans = loanRepository.findByUserIdAndStatus(userId, status);
        } else {
            loans = loanRepository.findByUserId(userId);
        }
        return loans.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanDTO> getActiveLoans(Long userId) {
        return loanRepository.findByUserIdAndStatus(userId, LoanStatus.ACTIVE)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanDTO> getAllOverdueLoans() {
        return loanRepository.findOverdueLoans(LocalDateTime.now())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public LoanDTO issueBook(com.sliit.library.dto.CirculationRequest request, Long issuedById) {
        String userId = request.getUserId();
        String accessionNumber = request.getAccessionNumber();
        Long reservationId = request.getReservationId();

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> LibraryException.notFound("User", userId));

        // Check if user has active loans limit
        long activeLoanCount = loanRepository.countActiveLoansByUser(user.getId());
        if (activeLoanCount >= user.getMaxLoans()) {
            throw LibraryException.validation("User has reached the maximum loan limit of " + user.getMaxLoans());
        }

        // Check if user has outstanding fines > 500
        BigDecimal totalFines = fineRepository.getTotalUnpaidFinesByUser(user.getId());
        if (totalFines != null && totalFines.compareTo(new BigDecimal("500")) > 0) {
            throw LibraryException.validation("User has outstanding fines of LKR " + totalFines + ". Payment required.");
        }

        BookCopy copy = bookCopyRepository.findByAccessionNumber(accessionNumber)
                .orElseThrow(() -> LibraryException.notFound("Book copy", accessionNumber));

        if (!Boolean.TRUE.equals(copy.getIsAvailable()) && reservationId == null) {
            throw LibraryException.validation("Book copy is not available for loan");
        }

        Book book = copy.getBook();

        if (reservationId != null) {
            Reservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> LibraryException.notFound("Reservation", reservationId.toString()));
            if (!reservation.getUser().getId().equals(user.getId())) {
                throw LibraryException.validation("Reservation does not belong to this user");
            }
            if (!reservation.getBook().getId().equals(book.getId())) {
                throw LibraryException.validation("Reservation is for a different book");
            }
            if (reservation.getStatus() != ReservationStatus.AVAILABLE && reservation.getStatus() != ReservationStatus.PENDING) {
                throw LibraryException.validation("Reservation is not active");
            }
            reservation.setStatus(ReservationStatus.FULFILLED);
            reservationRepository.save(reservation);
        }

        User issuedBy = userRepository.findById(issuedById)
                .orElseThrow(() -> LibraryException.notFound("Librarian", issuedById.toString()));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dueDate = now.plusDays(user.getLoanPeriodDays());

        Loan loan = Loan.builder()
                .user(user)
                .bookCopy(copy)
                .book(book)
                .issueDate(now)
                .dueDate(dueDate)
                .status(LoanStatus.ACTIVE)
                .issuedBy(issuedBy)
                .build();

        copy.setIsAvailable(false);
        bookCopyRepository.save(copy);

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Loan saved = loanRepository.save(loan);
        log.info("Book issued: {} to {} (Loan ID: {})", book.getTitle(), user.getUserId(), saved.getId());

        return mapToDTO(saved);
    }

    @Transactional
    public LoanDTO returnBookByAccession(String accessionNumber) {
        Loan loan = loanRepository.findByBookCopyAccessionNumberAndStatus(accessionNumber, LoanStatus.ACTIVE)
                .orElseThrow(() -> LibraryException.validation("No active loan found for this book copy"));
        return returnBook(loan.getId());
    }

    @Transactional
    public LoanDTO returnBook(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> LibraryException.notFound("Loan", loanId.toString()));

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw LibraryException.validation("Loan is not active");
        }

        loan.setReturnDate(LocalDateTime.now());
        loan.setStatus(LoanStatus.RETURNED);

        BookCopy copy = loan.getBookCopy();
        copy.setIsAvailable(true);
        bookCopyRepository.save(copy);

        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        // Check for overdue fine
        if (loan.getReturnDate().isAfter(loan.getDueDate())) {
            long daysOverdue = java.time.Duration.between(loan.getDueDate(), loan.getReturnDate()).toDays();
            BigDecimal rate = new BigDecimal(configRepository.findByConfigKey("fine.daily_rate")
                    .map(c -> c.getConfigValue()).orElse("5.00"));
            BigDecimal fineAmount = rate.multiply(new BigDecimal(daysOverdue));

            Fine fine = Fine.builder()
                    .loan(loan)
                    .user(loan.getUser())
                    .amountLkr(fineAmount)
                    .balanceLkr(fineAmount)
                    .fineType(FineType.OVERDUE)
                    .daysOverdue((int) daysOverdue)
                    .ratePerDay(rate)
                    .build();
            fineRepository.save(fine);
            log.info("Fine created for overdue loan {}: LKR {}", loanId, fineAmount);
        }

        // Check reservation queue
        processReservationQueue(book);

        Loan saved = loanRepository.save(loan);
        log.info("Book returned: {} (Loan ID: {})", book.getTitle(), loanId);
        return mapToDTO(saved);
    }

    @Transactional
    public LoanDTO renewLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> LibraryException.notFound("Loan", loanId.toString()));

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw LibraryException.validation("Only active loans can be renewed");
        }

        int maxRenewals = Integer.parseInt(configRepository.findByConfigKey("loan.max_renewals")
                .map(c -> c.getConfigValue()).orElse("2"));

        if (loan.getRenewalCount() >= maxRenewals) {
            throw LibraryException.validation("Maximum renewals (" + maxRenewals + ") reached");
        }

        // Check if book has pending reservations
        long pendingReservations = reservationRepository.countPendingByBook(loan.getBook().getId());
        if (pendingReservations > 0) {
            throw LibraryException.validation("Book has pending reservations. Renewal not allowed.");
        }

        User user = loan.getUser();
        loan.setDueDate(LocalDateTime.now().plusDays(user.getLoanPeriodDays()));
        loan.setRenewalCount(loan.getRenewalCount() + 1);

        Loan saved = loanRepository.save(loan);
        log.info("Loan renewed: {} (Renewal count: {})", loanId, saved.getRenewalCount());
        return mapToDTO(saved);
    }

    private void processReservationQueue(Book book) {
        reservationRepository.findFirstByBookIdAndStatusOrderByQueuePositionAsc(book.getId(), ReservationStatus.PENDING)
                .ifPresent(reservation -> {
                    reservation.setStatus(ReservationStatus.AVAILABLE);
                    reservation.setAvailableDate(LocalDateTime.now());
                    int holdHours = Integer.parseInt(configRepository.findByConfigKey("reservation.hold_hours")
                            .map(c -> c.getConfigValue()).orElse("48"));
                    reservation.setExpiryDate(LocalDateTime.now().plusHours(holdHours));
                    reservationRepository.save(reservation);
                    log.info("Reservation {} marked as available for user {}",
                            reservation.getId(), reservation.getUser().getUserId());
                    
                    notificationService.sendReservationAvailableNotification(reservation);
                });
    }

    private LoanDTO mapToDTO(Loan loan) {
        boolean canRenew = loan.getStatus() == LoanStatus.ACTIVE &&
                (reservationRepository.countPendingByBook(loan.getBook().getId()) == 0);

        return LoanDTO.builder()
                .id(loan.getId())
                .userId(loan.getUser() != null ? loan.getUser().getId() : null)
                .userName(loan.getUser() != null ? loan.getUser().getFullName() : null)
                .bookCopyId(loan.getBookCopy() != null ? loan.getBookCopy().getId() : null)
                .accessionNumber(loan.getBookCopy() != null ? loan.getBookCopy().getAccessionNumber() : null)
                .bookId(loan.getBook() != null ? loan.getBook().getId() : null)
                .bookTitle(loan.getBook() != null ? loan.getBook().getTitle() : null)
                .bookAuthor(loan.getBook() != null ? loan.getBook().getAuthor() : null)
                .issueDate(loan.getIssueDate())
                .dueDate(loan.getDueDate())
                .returnDate(loan.getReturnDate())
                .renewalCount(loan.getRenewalCount())
                .status(loan.getStatus())
                .issuedById(loan.getIssuedBy() != null ? loan.getIssuedBy().getId() : null)
                .issuedByName(loan.getIssuedBy() != null ? loan.getIssuedBy().getFullName() : null)
                .daysOverdue(loan.getDaysOverdue())
                .canRenew(canRenew)
                .createdAt(loan.getCreatedAt())
                .build();
    }
}
