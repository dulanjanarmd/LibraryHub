package com.sliit.library.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "book_copies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "accession_number", nullable = false, unique = true, length = 30)
    private String accessionNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_status", nullable = false)
    private ConditionStatus conditionStatus;

    @Column(name = "acquisition_date")
    private LocalDate acquisitionDate;

    @Column(name = "cost_lkr", precision = 10, scale = 2)
    private BigDecimal costLkr;

    @Column(name = "shelf_location", length = 20)
    private String shelfLocation;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum ConditionStatus {
        NEW, GOOD, FAIR, DAMAGED, UNDER_REPAIR, LOST, WITHDRAWN
    }

    @PrePersist
    public void prePersist() {
        if (this.conditionStatus == null) this.conditionStatus = ConditionStatus.NEW;
        if (this.isAvailable == null) this.isAvailable = true;
    }
}
