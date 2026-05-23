package com.library.repository;

import com.library.entity.Transaction;
import com.library.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByBookIdAndMemberIdAndStatus(Long bookId, Long memberId, TransactionStatus status);

    List<Transaction> findByStatus(TransactionStatus status);

    @Query("""
            SELECT t FROM Transaction t
            WHERE (:bookSearch IS NULL OR :bookSearch = ''
                   OR LOWER(t.book.title) LIKE LOWER(CONCAT('%', :bookSearch, '%'))
                   OR LOWER(t.book.isbn) LIKE LOWER(CONCAT('%', :bookSearch, '%'))
                   OR CAST(t.book.id AS string) = :bookSearch)
              AND (:memberSearch IS NULL OR :memberSearch = ''
                   OR LOWER(t.member.name) LIKE LOWER(CONCAT('%', :memberSearch, '%'))
                   OR LOWER(t.member.email) LIKE LOWER(CONCAT('%', :memberSearch, '%'))
                   OR CAST(t.member.id AS string) = :memberSearch)
            ORDER BY t.issuedAt DESC
            """)
    Page<Transaction> search(@Param("bookSearch") String bookSearch,
                             @Param("memberSearch") String memberSearch,
                             Pageable pageable);
}
