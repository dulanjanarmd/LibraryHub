package com.sliit.library.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PopularBookDTO {

    private Long bookId;
    private String title;
    private String author;
    private String isbn;
    private Integer borrowCount;
    private Integer totalCopies;
    private Integer availableCopies;
    private String coverImageUrl;
}
