package com.sliit.library.repository;

import com.sliit.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    boolean existsByIsbn(String isbn);

    List<Book> findByCategoryId(Long categoryId);

    Page<Book> findByCategoryId(Long categoryId, Pageable pageable);

    List<Book> findByIsActiveTrue();

    Page<Book> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.isActive = true AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "b.isbn LIKE CONCAT('%', :query, '%') OR " +
           "LOWER(b.publisher) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.ddcNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Book> searchBooks(@Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.isActive = true AND " +
           "b.availableCopies > 0 AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Book> searchAvailableBooks(@Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.isActive = true AND b.format = :format")
    Page<Book> findByFormat(@Param("format") Book.BookFormat format, Pageable pageable);

    @Query("SELECT COUNT(b) FROM Book b WHERE b.isActive = true")
    long countActiveBooks();

    @Query("SELECT COUNT(b) FROM Book b WHERE b.availableCopies = 0 AND b.isActive = true")
    long countUnavailableBooks();

    @Query("SELECT b FROM Book b WHERE b.isActive = true ORDER BY b.createdAt DESC")
    List<Book> findRecentAdditions(Pageable pageable);
}
