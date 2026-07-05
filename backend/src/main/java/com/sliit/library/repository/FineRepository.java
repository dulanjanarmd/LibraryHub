package com.sliit.library.repository;

import com.sliit.library.entity.Fine;
import com.sliit.library.entity.FineStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {

    List<Fine> findByUserId(Long userId);

    List<Fine> findByStatus(FineStatus status);

    List<Fine> findByUserIdAndStatus(Long userId, FineStatus status);

    @Query("SELECT f FROM Fine f WHERE f.status IN (com.sliit.library.entity.FineStatus.UNPAID, com.sliit.library.entity.FineStatus.PARTIALLY_PAID) AND f.user.id = :userId")
    List<Fine> findUnpaidByUser(@Param("userId") Long userId);

    @Query("SELECT SUM(f.amount - f.paidAmount - f.waivedAmount) FROM Fine f WHERE f.user.id = :userId AND f.status IN (com.sliit.library.entity.FineStatus.UNPAID, com.sliit.library.entity.FineStatus.PARTIALLY_PAID)")
    Double getTotalOutstandingByUser(@Param("userId") Long userId);

    @Query("SELECT SUM(f.paidAmount) FROM Fine f WHERE f.status = com.sliit.library.entity.FineStatus.PAID")
    Double getTotalCollected();

    @Query("SELECT SUM(f.amount - f.paidAmount - f.waivedAmount) FROM Fine f WHERE f.status IN (com.sliit.library.entity.FineStatus.UNPAID, com.sliit.library.entity.FineStatus.PARTIALLY_PAID)")
    Double getTotalOutstanding();

    Long countByStatus(FineStatus status);

    List<Fine> findByBorrowRecordId(Long borrowRecordId);
}