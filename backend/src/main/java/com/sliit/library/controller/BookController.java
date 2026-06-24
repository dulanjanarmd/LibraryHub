package com.sliit.library.controller;

import com.sliit.library.dto.ApiResponse;
import com.sliit.library.dto.BookDTO;
import com.sliit.library.dto.PagedResponse;
import com.sliit.library.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Tag(name = "Books", description = "Book catalogue management endpoints")
public class BookController {

    private final BookService bookService;

    @GetMapping
    @Operation(summary = "Get all books with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<BookDTO>>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {
        return ResponseEntity.ok(ApiResponse.success(bookService.getAllBooks(page, size, sortBy, direction)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get book by ID")
    public ResponseEntity<ApiResponse<BookDTO>> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookService.getBookById(id)));
    }

    @GetMapping("/isbn/{isbn}")
    @Operation(summary = "Get book by ISBN")
    public ResponseEntity<ApiResponse<BookDTO>> getBookByIsbn(@PathVariable String isbn) {
        return ResponseEntity.ok(ApiResponse.success(bookService.getBookByIsbn(isbn)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search books by title, author, or ISBN")
    public ResponseEntity<ApiResponse<PagedResponse<BookDTO>>> searchBooks(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(bookService.searchBooks(query, page, size)));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get books by category")
    public ResponseEntity<ApiResponse<PagedResponse<BookDTO>>> getBooksByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(bookService.getBooksByCategory(categoryId, page, size)));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recently added books")
    public ResponseEntity<ApiResponse<List<BookDTO>>> getRecentBooks(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(bookService.getRecentAdditions(limit)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Create a new book (Admin/Librarian only)")
    public ResponseEntity<ApiResponse<BookDTO>> createBook(@Valid @RequestBody BookDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(bookService.createBook(dto), "Book created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Update a book (Admin/Librarian only)")
    public ResponseEntity<ApiResponse<BookDTO>> updateBook(@PathVariable Long id, @Valid @RequestBody BookDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(bookService.updateBook(id, dto), "Book updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Deactivate a book (Admin/Librarian only)")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Book deactivated successfully"));
    }

    @GetMapping("/stats/total")
    @Operation(summary = "Get total count of active books")
    public ResponseEntity<ApiResponse<Long>> getTotalBooks() {
        return ResponseEntity.ok(ApiResponse.success(bookService.countTotalBooks()));
    }
}
