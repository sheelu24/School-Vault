package com.library.repository;

import com.library.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    boolean existsByIsbn(String isbn);

    @Query("""
            SELECT b FROM Book b
            WHERE (:q IS NULL OR :q = ''
                   OR LOWER(b.title) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(b.author) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(COALESCE(b.category, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Book> search(@Param("q") String query, Pageable pageable);
}
