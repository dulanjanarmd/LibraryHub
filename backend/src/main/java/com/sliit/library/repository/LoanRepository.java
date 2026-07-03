package com.sliit.library.repository;

import com.sliit.library.entity.Loan;
import com.sliit.library.entity.enums.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    Optional<Loan> findByBookCopyAccessionNumberAndStatus(String accessionNumber, LoanStatus status);

    List<Loan> findByUserIdAndStatus(Long userId, LoanStatus status);

    Page<Loan> findByUserIdAndStatus(Long userId, LoanStatus status, Pageable pageable);

    List<Loan> findByUserId(Long userId);

    Page<Loan> findByUserId(Long userId, Pageable pageable);

    List<Loan> findByStatus(LoanStatus status);

    Page<Loan> findByStatus(LoanStatus status, Pageable pageable);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate < :now")
    List<Loan> findOverdueLoans(@Param("now") LocalDateTime now);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate BETWEEN :start AND :end")
    List<Loan> findLoansDueSoon(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.user.id = :userId AND l.status = 'ACTIVE'")
    long countActiveLoansByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = 'ACTIVE'")
    long countAllActiveLoans();

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate < :now")
    long countOverdueLoans(@Param("now") LocalDateTime now);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.bookCopy.id = :copyId")
    List<Loan> findActiveLoansByCopy(@Param("copyId") Long copyId);

    boolean existsByUserIdAndStatus(Long userId, LoanStatus status);
}
