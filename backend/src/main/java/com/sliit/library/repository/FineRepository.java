package com.sliit.library.repository;

import com.sliit.library.entity.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {

    List<Fine> findByUserId(Long userId);

    List<Fine> findByUserIdAndIsPaidFalse(Long userId);

    List<Fine> findByIsPaidFalse();

    Optional<Fine> findByLoanId(Long loanId);

    @Query("SELECT SUM(f.balanceLkr) FROM Fine f WHERE f.user.id = :userId AND f.isPaid = false")
    BigDecimal getTotalUnpaidFinesByUser(@Param("userId") Long userId);

    @Query("SELECT SUM(f.paidAmountLkr) FROM Fine f WHERE f.isPaid = true AND MONTH(f.paymentDate) = MONTH(CURRENT_DATE) AND YEAR(f.paymentDate) = YEAR(CURRENT_DATE)")
    BigDecimal getMonthlyFineRevenue();

    @Query("SELECT COUNT(f) FROM Fine f WHERE f.isPaid = false AND f.balanceLkr > 0")
    long countUnpaidFines();

    boolean existsByUserIdAndIsPaidFalse(Long userId);
}
