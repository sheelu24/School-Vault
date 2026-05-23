package com.library.service;

import com.library.dto.BookDto;
import com.library.dto.BookRequest;
import com.library.exception.BusinessException;
import com.library.exception.DuplicateResourceException;
import com.library.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class BookServiceTest {

    @Autowired private BookService bookService;

    private BookRequest sample() {
        return BookRequest.builder()
                .title("Domain-Driven Design")
                .author("Eric Evans")
                .isbn("9780321125217")
                .category("Software")
                .totalCopies(3)
                .availableCopies(3)
                .build();
    }

    @Test
    void createPersistsBook() {
        BookDto created = bookService.create(sample());
        assertThat(created.getId()).isNotNull();
        assertThat(bookService.getById(created.getId()).getTitle()).isEqualTo("Domain-Driven Design");
    }

    @Test
    void duplicateIsbnRejected() {
        bookService.create(sample());
        assertThatThrownBy(() -> bookService.create(sample()))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void availableCannotExceedTotalOnCreate() {
        BookRequest req = sample();
        req.setTotalCopies(2);
        req.setAvailableCopies(5);
        assertThatThrownBy(() -> bookService.create(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("availableCopies");
    }

    @Test
    void getByIdMissingThrows() {
        assertThatThrownBy(() -> bookService.getById(9999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void softDeleteRemovesFromSearch() {
        BookDto book = bookService.create(sample());
        bookService.delete(book.getId());
        assertThatThrownBy(() -> bookService.getById(book.getId()))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
