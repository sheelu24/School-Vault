package com.library.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;

    @NotBlank(message = "Author is required")
    @Size(max = 255)
    private String author;

    @NotBlank(message = "ISBN is required")
    @Size(max = 32)
    private String isbn;

    @Size(max = 100)
    private String category;

    @Min(value = 0, message = "totalCopies must be >= 0")
    private Integer totalCopies;

    @Min(value = 0, message = "availableCopies must be >= 0")
    private Integer availableCopies;

    @Size(max = 64)
    private String shelfLocation;
}
