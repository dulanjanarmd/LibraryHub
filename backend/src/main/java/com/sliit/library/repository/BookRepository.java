package com.sliit.library.repository;

import com.sliit.library.entity.Book;
import com.sliit.library.entity.BookStatus;
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

    Boolean existsByIsbn(String isbn);

    List<Book> findByStatus(BookStatus status);

    List<Book> findByCategoryId(Long categoryId);

    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.publisher) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.subjectHeadings) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Book> searchBooks(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE " +
           "(:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
           "(:isbn IS NULL OR b.isbn = :isbn) AND " +
           "(:categoryId IS NULL OR b.category.id = :categoryId) AND " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:year IS NULL OR b.publicationYear = :year)")
    Page<Book> advancedSearch(
            @Param("title") String title,
            @Param("author") String author,
            @Param("isbn") String isbn,
            @Param("categoryId") Long categoryId,
            @Param("status") BookStatus status,
            @Param("year") Integer year,
            Pageable pageable);

    @Query("SELECT b FROM Book b ORDER BY b.borrowCount DESC")
    List<Book> findMostPopularBooks(Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.availableCopies = 0")
    List<Book> findUnavailableBooks();

    @Query("SELECT COUNT(b) FROM Book b WHERE b.status = :status")
    Long countByStatus(@Param("status") BookStatus status);
}
