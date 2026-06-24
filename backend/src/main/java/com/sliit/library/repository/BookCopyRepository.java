package com.sliit.library.repository;

import com.sliit.library.entity.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {

    List<BookCopy> findByBookId(Long bookId);

    Optional<BookCopy> findByAccessionNumber(String accessionNumber);

    boolean existsByAccessionNumber(String accessionNumber);

    @Query("SELECT COUNT(bc) FROM BookCopy bc WHERE bc.isAvailable = true AND bc.book.id = :bookId AND bc.conditionStatus NOT IN ('LOST', 'WITHDRAWN', 'UNDER_REPAIR')")
    long countAvailableByBookId(@Param("bookId") Long bookId);

    @Query("SELECT bc FROM BookCopy bc WHERE bc.book.id = :bookId AND bc.isAvailable = true AND bc.conditionStatus = 'NEW' ORDER BY bc.id")
    List<BookCopy> findAvailableByBookId(@Param("bookId") Long bookId);
}
