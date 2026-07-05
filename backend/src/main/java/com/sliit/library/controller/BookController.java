package com.sliit.library.controller;

import com.sliit.library.dto.*;
import com.sliit.library.entity.BookStatus;
import com.sliit.library.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping("/books")
    public ResponseEntity<Page<BookResponse>> getAllBooks(Pageable pageable) {
        return ResponseEntity.ok(bookService.getAllBooks(pageable));
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBook(id));
    }

    @GetMapping("/books/search")
    public ResponseEntity<Page<BookResponse>> searchBooks(
            @RequestParam String keyword,
            Pageable pageable) {
        return ResponseEntity.ok(bookService.searchBooks(keyword, pageable));
    }

    @GetMapping("/books/advanced-search")
    public ResponseEntity<Page<BookResponse>> advancedSearch(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BookStatus status,
            @RequestParam(required = false) Integer year,
            Pageable pageable) {
        return ResponseEntity.ok(bookService.advancedSearch(title, author, isbn, categoryId, status, year, pageable));
    }

    @GetMapping("/books/popular")
    public ResponseEntity<List<BookResponse>> getPopularBooks(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(bookService.getPopularBooks(limit));
    }

    @GetMapping("/books/category/{categoryId}")
    public ResponseEntity<List<BookResponse>> getBooksByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(bookService.getBooksByCategory(categoryId));
    }

    @GetMapping("/books/status/{status}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<BookResponse>> getBooksByStatus(@PathVariable BookStatus status) {
        return ResponseEntity.ok(bookService.getBooksByStatus(status));
    }

    @PostMapping("/librarian/books")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<BookResponse> addBook(@RequestBody BookRequestDTO request) {
        return ResponseEntity.ok(bookService.addBook(request));
    }

    @PutMapping("/librarian/books/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<BookResponse> updateBook(@PathVariable Long id, @RequestBody BookRequestDTO request) {
        return ResponseEntity.ok(bookService.updateBook(id, request));
    }

    @DeleteMapping("/librarian/books/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(new MessageResponse("Book deleted successfully"));
    }
}
