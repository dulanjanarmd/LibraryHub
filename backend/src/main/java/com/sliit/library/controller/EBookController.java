package com.sliit.library.controller;

import com.sliit.library.dto.*;
import com.sliit.library.service.EBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class EBookController {

    @Autowired
    private EBookService eBookService;

    @GetMapping("/ebooks/public/all")
    public ResponseEntity<List<EBookResponse>> getAllPublicEBooks() {
        return ResponseEntity.ok(eBookService.getAllPublicEBooks());
    }

    @GetMapping("/ebooks/public/search")
    public ResponseEntity<Page<EBookResponse>> searchEBooks(
            @RequestParam String keyword,
            Pageable pageable) {
        return ResponseEntity.ok(eBookService.searchEBooks(keyword, pageable));
    }

    @GetMapping("/ebooks/public/{id}")
    public ResponseEntity<EBookResponse> getEBook(@PathVariable Long id) {
        return ResponseEntity.ok(eBookService.getEBook(id));
    }

    @GetMapping("/ebooks/download/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadEBook(@PathVariable Long id) throws IOException {
        byte[] fileContent = eBookService.downloadEBook(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ebook.pdf\"")
                .body(fileContent);
    }

    @PostMapping(value = "/librarian/ebooks/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<EBookResponse> uploadEBook(
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam(value = "isbn", required = false) String isbn,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "publisher", required = false) String publisher,
            @RequestParam(value = "publicationYear", required = false) Integer publicationYear,
            @RequestParam(value = "language", required = false) String language,
            @RequestParam("file") MultipartFile file) throws IOException {

        return ResponseEntity.ok(eBookService.uploadEBook(
                title, author, isbn, description, publisher, publicationYear, language, file));
    }

    @DeleteMapping("/librarian/ebooks/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteEBook(@PathVariable Long id) {
        eBookService.deleteEBook(id);
        return ResponseEntity.ok(new MessageResponse("eBook deleted successfully"));
    }
}
