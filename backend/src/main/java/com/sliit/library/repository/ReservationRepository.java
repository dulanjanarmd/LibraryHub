package com.sliit.library.repository;

import com.sliit.library.entity.Reservation;
import com.sliit.library.entity.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status);

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByBookIdAndStatusOrderByQueuePositionAsc(Long bookId, ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE r.book.id = :bookId AND r.status = 'PENDING' ORDER BY r.queuePosition ASC")
    List<Reservation> findPendingReservationsByBook(@Param("bookId") Long bookId);

    @Query("SELECT MAX(r.queuePosition) FROM Reservation r WHERE r.book.id = :bookId AND r.status = 'PENDING'")
    Integer findMaxQueuePosition(@Param("bookId") Long bookId);

    Optional<Reservation> findFirstByBookIdAndStatusOrderByQueuePositionAsc(Long bookId, ReservationStatus status);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.user.id = :userId AND r.status = 'PENDING'")
    long countPendingByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.book.id = :bookId AND r.status = 'PENDING'")
    long countPendingByBook(@Param("bookId") Long bookId);
}
