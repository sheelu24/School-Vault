package com.library.controller;

import com.library.dto.BookDto;
import com.library.dto.BookRequest;
import com.library.dto.PageResponse;
import com.library.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/v1/books")
@RequiredArgsConstructor
@Tag(name = "Books")
public class BookController {

    private final BookService bookService;

    @GetMapping
    @Operation(summary = "Search/list books with pagination")
    public PageResponse<BookDto> list(@RequestParam(name = "q", required = false) String query,
                                      @PageableDefault(size = 20, sort = "title") Pageable pageable) {
        return bookService.search(query, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get book by id")
    public BookDto getById(@PathVariable Long id) {
        return bookService.getById(id);
    }

    @PostMapping
    @Operation(summary = "Create a new book")
    public ResponseEntity<BookDto> create(@Valid @RequestBody BookRequest request) {
        BookDto created = bookService.create(request);
        return ResponseEntity.created(URI.create("/v1/books/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a book")
    public BookDto update(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        return bookService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a book")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        bookService.delete(id);
    }
}
