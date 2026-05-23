package com.library.dto;

import com.library.entity.Transaction;
import com.library.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {

    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private Long memberId;
    private String memberName;
    private String memberEmail;
    private Instant issuedAt;
    private Instant dueDate;
    private Instant returnedAt;
    private TransactionStatus status;
    private long fineCents;

    public static TransactionDto fromEntity(Transaction tx, long fineCents) {
        return TransactionDto.builder()
                .id(tx.getId())
                .bookId(tx.getBook().getId())
                .bookTitle(tx.getBook().getTitle())
                .bookIsbn(tx.getBook().getIsbn())
                .memberId(tx.getMember().getId())
                .memberName(tx.getMember().getName())
                .memberEmail(tx.getMember().getEmail())
                .issuedAt(tx.getIssuedAt())
                .dueDate(tx.getDueDate())
                .returnedAt(tx.getReturnedAt())
                .status(tx.getStatus())
                .fineCents(fineCents)
                .build();
    }
}
