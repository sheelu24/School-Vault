package com.library.service;

import com.library.dto.BookDto;
import com.library.dto.BookRequest;
import com.library.dto.PageResponse;
import com.library.entity.Book;
import com.library.exception.BusinessException;
import com.library.exception.DuplicateResourceException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public PageResponse<BookDto> search(String query, Pageable pageable) {
        Page<Book> page = bookRepository.search(query, pageable);
        return PageResponse.from(page, BookDto::fromEntity);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "books", key = "#id")
    public BookDto getById(Long id) {
        return BookDto.fromEntity(loadBook(id));
    }

    @Transactional
    @CacheEvict(value = "books", allEntries = true)
    public BookDto create(BookRequest request) {
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("A book with ISBN '" + request.getIsbn() + "' already exists");
        }
        int total = request.getTotalCopies() == null ? 0 : request.getTotalCopies();
        int available = request.getAvailableCopies() == null ? total : request.getAvailableCopies();
        if (available > total) {
            throw new BusinessException("availableCopies cannot exceed totalCopies");
        }

        Book book = Book.builder()
                .title(request.getTitle().trim())
                .author(request.getAuthor().trim())
                .isbn(request.getIsbn().trim())
                .category(request.getCategory())
                .totalCopies(total)
                .availableCopies(available)
                .shelfLocation(request.getShelfLocation())
                .deleted(false)
                .build();
        Book saved = bookRepository.save(book);
        auditService.record("Book", saved.getId(), "CREATE", "Created book '" + saved.getTitle() + "'");
        return BookDto.fromEntity(saved);
    }

    @Transactional
    @CacheEvict(value = "books", key = "#id")
    public BookDto update(Long id, BookRequest request) {
        Book book = loadBook(id);

        if (!book.getIsbn().equals(request.getIsbn())
                && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("A book with ISBN '" + request.getIsbn() + "' already exists");
        }

        int newTotal = request.getTotalCopies() == null ? book.getTotalCopies() : request.getTotalCopies();
        int issued = book.getTotalCopies() - book.getAvailableCopies();
        if (newTotal < issued) {
            throw new BusinessException(
                    "totalCopies (" + newTotal + ") cannot be less than the number currently issued (" + issued + ")");
        }
        int newAvailable = request.getAvailableCopies() == null
                ? newTotal - issued
                : request.getAvailableCopies();
        if (newAvailable > newTotal) {
            throw new BusinessException("availableCopies cannot exceed totalCopies");
        }
        if (newAvailable < 0) {
            throw new BusinessException("availableCopies must be >= 0");
        }

        book.setTitle(request.getTitle().trim());
        book.setAuthor(request.getAuthor().trim());
        book.setIsbn(request.getIsbn().trim());
        book.setCategory(request.getCategory());
        book.setTotalCopies(newTotal);
        book.setAvailableCopies(newAvailable);
        book.setShelfLocation(request.getShelfLocation());
        auditService.record("Book", book.getId(), "UPDATE", "Updated book '" + book.getTitle() + "'");
        return BookDto.fromEntity(book);
    }

    @Transactional
    @CacheEvict(value = "books", key = "#id")
    public void delete(Long id) {
        Book book = loadBook(id);
        int issued = book.getTotalCopies() - book.getAvailableCopies();
        if (issued > 0) {
            throw new BusinessException("Cannot delete a book that has " + issued + " active issue(s)");
        }
        bookRepository.delete(book);
        auditService.record("Book", book.getId(), "DELETE", "Soft-deleted book '" + book.getTitle() + "'");
    }

    Book loadBook(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id " + id));
    }
}
