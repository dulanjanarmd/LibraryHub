package com.sliit.library.service;

import com.sliit.library.dto.BookDTO;
import com.sliit.library.dto.PagedResponse;
import com.sliit.library.entity.Book;
import com.sliit.library.entity.Category;
import com.sliit.library.exception.LibraryException;
import com.sliit.library.repository.BookRepository;
import com.sliit.library.repository.BookCopyRepository;
import com.sliit.library.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public PagedResponse<BookDTO> getAllBooks(int page, int size, String sortBy, String direction) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Book> books = bookRepository.findByIsActiveTrue(pageable);
        return mapToPagedResponse(books);
    }

    @Transactional(readOnly = true)
    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> LibraryException.notFound("Book", id.toString()));
        return mapToDTO(book);
    }

    @Transactional(readOnly = true)
    public BookDTO getBookByIsbn(String isbn) {
        Book book = bookRepository.findByIsbn(isbn)
                .orElseThrow(() -> LibraryException.notFound("Book", isbn));
        return mapToDTO(book);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BookDTO> searchBooks(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("title").ascending());
        Page<Book> books = bookRepository.searchBooks(query, pageable);
        return mapToPagedResponse(books);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BookDTO> getBooksByCategory(Long categoryId, int page, int size) {
        if (!categoryRepository.existsById(categoryId)) {
            throw LibraryException.notFound("Category", categoryId.toString());
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("title").ascending());
        Page<Book> books = bookRepository.findByCategoryId(categoryId, pageable);
        return mapToPagedResponse(books);
    }

    @Transactional
    public BookDTO createBook(BookDTO dto) {
        if (bookRepository.existsByIsbn(dto.getIsbn())) {
            throw LibraryException.conflict("Book with ISBN " + dto.getIsbn() + " already exists");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> LibraryException.notFound("Category", dto.getCategoryId().toString()));

        Book book = Book.builder()
                .isbn(dto.getIsbn())
                .title(dto.getTitle())
                .author(dto.getAuthor())
                .publisher(dto.getPublisher())
                .publicationYear(dto.getPublicationYear())
                .edition(dto.getEdition())
                .description(dto.getDescription())
                .ddcNumber(dto.getDdcNumber())
                .language(dto.getLanguage())
                .format(dto.getFormat())
                .category(category)
                .coverImageUrl(dto.getCoverImageUrl())
                .pageCount(dto.getPageCount())
                .totalCopies(dto.getTotalCopies() != null ? dto.getTotalCopies() : 1)
                .availableCopies(dto.getTotalCopies() != null ? dto.getTotalCopies() : 1)
                .shelfLocation(dto.getShelfLocation())
                .isActive(true)
                .build();

        Book saved = bookRepository.save(book);
        log.info("Book created: {} (ISBN: {})", saved.getTitle(), saved.getIsbn());
        return mapToDTO(saved);
    }

    @Transactional
    public BookDTO updateBook(Long id, BookDTO dto) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> LibraryException.notFound("Book", id.toString()));

        if (dto.getIsbn() != null) book.setIsbn(dto.getIsbn());
        if (dto.getTitle() != null) book.setTitle(dto.getTitle());
        if (dto.getAuthor() != null) book.setAuthor(dto.getAuthor());
        if (dto.getPublisher() != null) book.setPublisher(dto.getPublisher());
        if (dto.getPublicationYear() != null) book.setPublicationYear(dto.getPublicationYear());
        if (dto.getDescription() != null) book.setDescription(dto.getDescription());
        if (dto.getDdcNumber() != null) book.setDdcNumber(dto.getDdcNumber());
        if (dto.getCoverImageUrl() != null) book.setCoverImageUrl(dto.getCoverImageUrl());
        if (dto.getShelfLocation() != null) book.setShelfLocation(dto.getShelfLocation());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> LibraryException.notFound("Category", dto.getCategoryId().toString()));
            book.setCategory(category);
        }

        Book updated = bookRepository.save(book);
        log.info("Book updated: {} (ID: {})", updated.getTitle(), updated.getId());
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> LibraryException.notFound("Book", id.toString()));
        book.setIsActive(false);
        bookRepository.save(book);
        log.info("Book deactivated: {} (ID: {})", book.getTitle(), id);
    }

    @Transactional(readOnly = true)
    public long countTotalBooks() {
        return bookRepository.countActiveBooks();
    }

    @Transactional(readOnly = true)
    public List<BookDTO> getRecentAdditions(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        return bookRepository.findRecentAdditions(pageable).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private PagedResponse<BookDTO> mapToPagedResponse(Page<Book> page) {
        List<BookDTO> content = page.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return PagedResponse.<BookDTO>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }

    public BookDTO mapToDTO(Book book) {
        return BookDTO.builder()
                .id(book.getId())
                .isbn(book.getIsbn())
                .title(book.getTitle())
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .publicationYear(book.getPublicationYear())
                .edition(book.getEdition())
                .description(book.getDescription())
                .ddcNumber(book.getDdcNumber())
                .language(book.getLanguage())
                .format(book.getFormat())
                .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .coverImageUrl(book.getCoverImageUrl())
                .pageCount(book.getPageCount())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .shelfLocation(book.getShelfLocation())
                .isActive(book.getIsActive())
                .createdAt(book.getCreatedAt())
                .build();
    }
}
