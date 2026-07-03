package com.sliit.library.dto;

import com.sliit.library.entity.Book;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookDTO {

    private Long id;

    @NotBlank(message = "ISBN is required")
    private String isbn;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Author is required")
    private String author;

    private String publisher;
    private Integer publicationYear;
    private String edition;
    private String description;
    private String ddcNumber;
    private String language;

    @NotNull(message = "Format is required")
    private Book.BookFormat format;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String categoryName;
    private String coverImageUrl;
    private String resourceUrl;
    private Integer pageCount;
    private Integer totalCopies;
    private Integer availableCopies;
    private String shelfLocation;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
