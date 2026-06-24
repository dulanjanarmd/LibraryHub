package com.sliit.library.entity;

import com.sliit.library.entity.enums.FineType;
import com.sliit.library.entity.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fines")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "amount_lkr", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountLkr;

    @Column(name = "paid_amount_lkr", nullable = false, precision = 10, scale = 2)
    private BigDecimal paidAmountLkr;

    @Column(name = "balance_lkr", nullable = false, precision = 10, scale = 2)
    private BigDecimal balanceLkr;

    @Enumerated(EnumType.STRING)
    @Column(name = "fine_type", nullable = false)
    private FineType fineType;

    @Column(name = "days_overdue")
    private Integer daysOverdue;

    @Column(name = "rate_per_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal ratePerDay;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "receipt_number", length = 50)
    private String receiptNumber;

    @Column(name = "waiver_reason", columnDefinition = "TEXT")
    private String waiverReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waived_by")
    private User waivedBy;

    @Column(name = "waived_at")
    private LocalDateTime waivedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.paidAmountLkr == null) this.paidAmountLkr = BigDecimal.ZERO;
        if (this.balanceLkr == null) this.balanceLkr = this.amountLkr;
        if (this.isPaid == null) this.isPaid = false;
        if (this.ratePerDay == null) this.ratePerDay = new BigDecimal("5.00");
    }
}
