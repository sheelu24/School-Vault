package com.library.service;

import com.library.dto.IssueRequest;
import com.library.dto.PageResponse;
import com.library.dto.TransactionDto;
import com.library.entity.Book;
import com.library.entity.Member;
import com.library.entity.Transaction;
import com.library.enums.MemberStatus;
import com.library.enums.TransactionStatus;
import com.library.exception.BusinessException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.MemberRepository;
import com.library.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private static final int DEFAULT_LOAN_DAYS = 14;

    private final TransactionRepository transactionRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final FineCalculator fineCalculator;
    private final AuditService auditService;

    @Transactional
    public TransactionDto issue(IssueRequest request) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id " + request.getBookId()));
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id " + request.getMemberId()));

        if (member.getStatus() != MemberStatus.ACTIVE) {
            throw new BusinessException("Member is not active and cannot issue books");
        }
        if (book.getAvailableCopies() == null || book.getAvailableCopies() <= 0) {
            throw new BusinessException("No copies of this book are currently available");
        }
        transactionRepository
                .findByBookIdAndMemberIdAndStatus(book.getId(), member.getId(), TransactionStatus.ISSUED)
                .ifPresent(t -> {
                    throw new BusinessException(
                            "Member already has this book issued (transaction #" + t.getId() + ")");
                });

        int loanDays = (request.getLoanDays() == null || request.getLoanDays() <= 0)
                ? DEFAULT_LOAN_DAYS
                : request.getLoanDays();
        Instant now = Instant.now();
        Transaction tx = Transaction.builder()
                .book(book)
                .member(member)
                .issuedAt(now)
                .dueDate(now.plus(loanDays, ChronoUnit.DAYS))
                .status(TransactionStatus.ISSUED)
                .build();

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        Transaction saved = transactionRepository.save(tx);
        auditService.record("Transaction", saved.getId(), "ISSUE",
                "Issued '" + book.getTitle() + "' to " + member.getEmail());
        return TransactionDto.fromEntity(saved, fineCalculator.compute(saved));
    }

    @Transactional
    public TransactionDto returnBook(Long transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id " + transactionId));

        if (tx.getStatus() == TransactionStatus.RETURNED) {
            throw new BusinessException("This transaction is already marked as returned");
        }

        Book book = tx.getBook();
        if (book.getAvailableCopies() < book.getTotalCopies()) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
        }
        tx.setReturnedAt(Instant.now());
        tx.setStatus(TransactionStatus.RETURNED);
        long fine = fineCalculator.compute(tx);
        auditService.record("Transaction", tx.getId(), "RETURN",
                "Returned '" + book.getTitle() + "' (fine cents=" + fine + ")");
        return TransactionDto.fromEntity(tx, fine);
    }

    @Transactional(readOnly = true)
    public PageResponse<TransactionDto> list(String bookSearch, String memberSearch, Pageable pageable) {
        Page<Transaction> page = transactionRepository.search(
                bookSearch == null ? null : bookSearch.trim(),
                memberSearch == null ? null : memberSearch.trim(),
                pageable);
        return PageResponse.from(decorateWithOverdue(page),
                t -> TransactionDto.fromEntity(t, fineCalculator.compute(t)));
    }

    @Transactional
    public int markOverdue() {
        List<Transaction> issued = transactionRepository.findByStatus(TransactionStatus.ISSUED);
        Instant now = Instant.now();
        int count = 0;
        for (Transaction t : issued) {
            if (t.getDueDate().isBefore(now)) {
                t.setStatus(TransactionStatus.OVERDUE);
                count++;
            }
        }
        return count;
    }

    private Page<Transaction> decorateWithOverdue(Page<Transaction> page) {
        Instant now = Instant.now();
        page.getContent().forEach(t -> {
            if (t.getStatus() == TransactionStatus.ISSUED && t.getDueDate().isBefore(now)) {
                t.setStatus(TransactionStatus.OVERDUE);
            }
        });
        return page;
    }
}
