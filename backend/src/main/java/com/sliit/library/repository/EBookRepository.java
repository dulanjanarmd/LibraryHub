package com.sliit.library.repository;

import com.sliit.library.entity.EBook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EBookRepository extends JpaRepository<EBook, Long> {

    List<EBook> findByUploadedById(Long userId);

    @Query("SELECT e FROM EBook e WHERE " +
           "LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.isbn) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<EBook> searchEBooks(@Param("keyword") String keyword, Pageable pageable);

    List<EBook> findByIsPublicTrue();
}
