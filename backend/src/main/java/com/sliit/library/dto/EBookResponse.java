package com.sliit.library.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EBookResponse {

    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String description;
    private String publisher;
    private Integer publicationYear;
    private String language;
    private String fileFormat;
    private Long fileSize;
    private String coverImageUrl;
    private String filePath;
    private Boolean isPublic;
    private Integer downloadCount;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
}
