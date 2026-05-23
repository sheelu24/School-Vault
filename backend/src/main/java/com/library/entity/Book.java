package com.library.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.time.Instant;

@Entity
@Table(name = "books",
        uniqueConstraints = @UniqueConstraint(name = "uk_books_isbn", columnNames = "isbn"),
        indexes = {
                @Index(name = "idx_books_title", columnList = "title"),
                @Index(name = "idx_books_author", columnList = "author"),
                @Index(name = "idx_books_category", columnList = "category")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE books SET deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
@Where(clause = "deleted = false")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false, unique = true, length = 32)
    private String isbn;

    @Column(length = 100)
    private String category;

    @Column(name = "total_copies", nullable = false)
    private Integer totalCopies;

    @Column(name = "available_copies", nullable = false)
    private Integer availableCopies;

    @Column(name = "shelf_location", length = 64)
    private String shelfLocation;

    @Column(nullable = false)
    private boolean deleted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
