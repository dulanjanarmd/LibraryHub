package com.sliit.library.repository;

import com.sliit.library.entity.BookRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRequestRepository extends JpaRepository<BookRequest, Long> {

    List<BookRequest> findByRequestedById(Long userId);

    List<BookRequest> findByStatus(String status);
}
