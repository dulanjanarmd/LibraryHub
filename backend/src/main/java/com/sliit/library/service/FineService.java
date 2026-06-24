package com.sliit.library.service;

import com.sliit.library.dto.FineDTO;
import com.sliit.library.entity.Fine;
import com.sliit.library.entity.User;
import com.sliit.library.entity.enums.PaymentMethod;
import com.sliit.library.exception.LibraryException;
import com.sliit.library.repository.FineRepository;
import com.sliit.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FineService {

    private final FineRepository fineRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<FineDTO> getUserFines(Long userId) {
        return fineRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FineDTO> getUserUnpaidFines(Long userId) {
        return fineRepository.findByUserIdAndIsPaidFalse(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FineDTO> getAllUnpaidFines() {
        return fineRepository.findByIsPaidFalse().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BigDecimal getUserTotalUnpaidFines(Long userId) {
        BigDecimal total = fineRepository.getTotalUnpaidFinesByUser(userId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Transactional
    public FineDTO payFine(Long fineId, BigDecimal amount, PaymentMethod method) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> LibraryException.notFound("Fine", fineId.toString()));

        if (Boolean.TRUE.equals(fine.getIsPaid())) {
            throw LibraryException.validation("Fine is already paid");
        }

        if (amount.compareTo(fine.getBalanceLkr()) > 0) {
            amount = fine.getBalanceLkr(); // Cap at balance
        }

        fine.setPaidAmountLkr(fine.getPaidAmountLkr().add(amount));
        fine.setBalanceLkr(fine.getBalanceLkr().subtract(amount));

        if (fine.getBalanceLkr().compareTo(BigDecimal.ZERO) <= 0) {
            fine.setIsPaid(true);
            fine.setBalanceLkr(BigDecimal.ZERO);
        }

        fine.setPaymentDate(LocalDateTime.now());
        fine.setPaymentMethod(method);
        fine.setReceiptNumber("RCP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        Fine saved = fineRepository.save(fine);
        log.info("Fine {} payment processed: LKR {} via {}", fineId, amount, method);
        return mapToDTO(saved);
    }

    @Transactional
    public FineDTO waiveFine(Long fineId, String reason, Long waivedById) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> LibraryException.notFound("Fine", fineId.toString()));

        User waivedBy = userRepository.findById(waivedById)
                .orElseThrow(() -> LibraryException.notFound("Admin", waivedById.toString()));

        fine.setIsPaid(true);
        fine.setWaiverReason(reason);
        fine.setWaivedBy(waivedBy);
        fine.setWaivedAt(LocalDateTime.now());
        fine.setBalanceLkr(BigDecimal.ZERO);

        Fine saved = fineRepository.save(fine);
        log.info("Fine {} waived by {}: {}", fineId, waivedBy.getUserId(), reason);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public BigDecimal getMonthlyRevenue() {
        BigDecimal revenue = fineRepository.getMonthlyFineRevenue();
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    private FineDTO mapToDTO(Fine fine) {
        return FineDTO.builder()
                .id(fine.getId())
                .loanId(fine.getLoan() != null ? fine.getLoan().getId() : null)
                .userId(fine.getUser() != null ? fine.getUser().getId() : null)
                .userName(fine.getUser() != null ? fine.getUser().getFullName() : null)
                .amountLkr(fine.getAmountLkr())
                .paidAmountLkr(fine.getPaidAmountLkr())
                .balanceLkr(fine.getBalanceLkr())
                .fineType(fine.getFineType())
                .daysOverdue(fine.getDaysOverdue())
                .ratePerDay(fine.getRatePerDay())
                .isPaid(fine.getIsPaid())
                .paymentDate(fine.getPaymentDate())
                .paymentMethod(fine.getPaymentMethod())
                .receiptNumber(fine.getReceiptNumber())
                .waiverReason(fine.getWaiverReason())
                .waivedByName(fine.getWaivedBy() != null ? fine.getWaivedBy().getFullName() : null)
                .waivedAt(fine.getWaivedAt())
                .createdAt(fine.getCreatedAt())
                .build();
    }
}
