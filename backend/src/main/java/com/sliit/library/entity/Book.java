package com.sliit.library.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "books")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String isbn;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 255)
    private String author;

    @Column(length = 100)
    private String publisher;

    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(length = 20)
    private String edition;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "ddc_number", length = 20)
    private String ddcNumber;

    @Column(nullable = false, length = 20)
    private String language;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookFormat format;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "resource_url", length = 500)
    private String resourceUrl;

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(name = "total_copies", nullable = false)
    private Integer totalCopies;

    @Column(name = "available_copies", nullable = false)
    private Integer availableCopies;

    @Column(name = "shelf_location", length = 20)
    private String shelfLocation;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BookCopy> copies = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.language == null) this.language = "English";
        if (this.format == null) this.format = BookFormat.PHYSICAL;
        if (this.totalCopies == null) this.totalCopies = 1;
        if (this.availableCopies == null) this.availableCopies = this.totalCopies;
        if (this.isActive == null) this.isActive = true;
    }

    public enum BookFormat {
        PHYSICAL,
        EBOOK,
        JOURNAL,
        THESIS,
        MULTIMEDIA
    }
}
