package com.sliit.library.service;

import com.sliit.library.dto.*;
import com.sliit.library.entity.*;
import com.sliit.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FineService {

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<FineResponse> getUserFines(Long userId) {
        return fineRepository.findByUserId(userId).stream()
                .map(this::mapToFineResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FineResponse> getUnpaidFines(Long userId) {
        return fineRepository.findUnpaidByUser(userId).stream()
                .map(this::mapToFineResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FineResponse> getAllUnpaidFines() {
        return fineRepository.findByStatus(FineStatus.UNPAID).stream()
                .map(this::mapToFineResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FineResponse> getAllFines() {
        return fineRepository.findAll().stream()
                .map(this::mapToFineResponse)
                .toList();
    }

    @Transactional
    public MessageResponse payFine(PaymentRequest request) {
        Fine fine = fineRepository.findById(request.getFineId())
                .orElseThrow(() -> new RuntimeException("Fine not found"));

        double remaining = fine.getRemainingAmount();

        if (request.getAmount() > remaining) {
            return MessageResponse.builder()
                    .message("Payment amount exceeds remaining fine amount")
                    .success(false)
                    .build();
        }

        fine.setPaidAmount(fine.getPaidAmount() + request.getAmount());

        if (fine.getPaidAmount() >= fine.getAmount()) {
            fine.setStatus(FineStatus.PAID);
        } else if (fine.getPaidAmount() > 0) {
            fine.setStatus(FineStatus.PARTIALLY_PAID);
        }

        fineRepository.save(fine);

        User user = fine.getUser();
        Double totalOutstanding = fineRepository.getTotalOutstandingByUser(user.getId());
        user.setOutstandingFine(totalOutstanding != null ? totalOutstanding : 0.0);
        userRepository.save(user);

        notificationService.sendNotification(
                user,
                NotificationType.FINE_PAID,
                "Fine Payment Received",
                "LKR " + request.getAmount() + " has been paid. Remaining balance: LKR " + fine.getRemainingAmount()
        );

        return new MessageResponse("Payment successful. Remaining: LKR " + fine.getRemainingAmount());
    }

    @Transactional
    public MessageResponse waiveFine(Long fineId, Double amount, String reason, User waivedBy) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found"));

        double remaining = fine.getRemainingAmount();
        if (amount > remaining) {
            amount = remaining;
        }

        fine.setWaivedAmount(fine.getWaivedAmount() + amount);
        fine.setWaiverReason(reason);
        fine.setWaivedBy(waivedBy);

        if (fine.getWaivedAmount() >= fine.getAmount()) {
            fine.setStatus(FineStatus.WAIVED);
        }

        fineRepository.save(fine);

        User user = fine.getUser();
        Double totalOutstanding = fineRepository.getTotalOutstandingByUser(user.getId());
        user.setOutstandingFine(totalOutstanding != null ? totalOutstanding : 0.0);
        userRepository.save(user);

        return new MessageResponse("Fine waived successfully. Waived amount: LKR " + amount);
    }

    @Transactional(readOnly = true)
    public double getTotalOutstandingFines() {
        Double total = fineRepository.getTotalOutstanding();
        return total != null ? total : 0.0;
    }

    @Transactional(readOnly = true)
    public double getTotalCollectedFines() {
        Double total = fineRepository.getTotalCollected();
        return total != null ? total : 0.0;
    }

    private FineResponse mapToFineResponse(Fine fine) {
        return FineResponse.builder()
                .id(fine.getId())
                .userId(fine.getUser().getId())
                .userName(fine.getUser().getFullName())
                .bookId(fine.getBook() != null ? fine.getBook().getId() : null)
                .bookTitle(fine.getBook() != null ? fine.getBook().getTitle() : "N/A")
                .amount(fine.getAmount())
                .paidAmount(fine.getPaidAmount())
                .waivedAmount(fine.getWaivedAmount())
                .remainingAmount(fine.getRemainingAmount())
                .status(fine.getStatus())
                .overdueDays(fine.getOverdueDays())
                .fineDate(fine.getFineDate())
                .description(fine.getDescription())
                .waiverReason(fine.getWaiverReason())
                .createdAt(fine.getCreatedAt())
                .build();
    }
}
