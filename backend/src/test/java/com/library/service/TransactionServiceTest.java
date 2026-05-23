package com.library.service;

import com.library.dto.IssueRequest;
import com.library.dto.MemberRequest;
import com.library.dto.BookRequest;
import com.library.dto.BookDto;
import com.library.dto.MemberDto;
import com.library.dto.TransactionDto;
import com.library.enums.TransactionStatus;
import com.library.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class TransactionServiceTest {

    @Autowired private BookService bookService;
    @Autowired private MemberService memberService;
    @Autowired private TransactionService transactionService;

    private BookDto book;
    private MemberDto member;

    @BeforeEach
    void setUp() {
        book = bookService.create(BookRequest.builder()
                .title("Clean Code")
                .author("Robert C. Martin")
                .isbn("9780132350884")
                .category("Software")
                .totalCopies(2)
                .availableCopies(2)
                .build());

        member = memberService.create(MemberRequest.builder()
                .name("Ada Lovelace")
                .email("ada@example.com")
                .build());
    }

    @Test
    void issueDecrementsAvailableCopies() {
        TransactionDto tx = transactionService.issue(
                IssueRequest.builder().bookId(book.getId()).memberId(member.getId()).build());

        assertThat(tx.getStatus()).isEqualTo(TransactionStatus.ISSUED);
        assertThat(bookService.getById(book.getId()).getAvailableCopies()).isEqualTo(1);
    }

    @Test
    void cannotIssueSameBookTwiceWithoutReturning() {
        transactionService.issue(
                IssueRequest.builder().bookId(book.getId()).memberId(member.getId()).build());

        assertThatThrownBy(() -> transactionService.issue(
                IssueRequest.builder().bookId(book.getId()).memberId(member.getId()).build()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already has this book");
    }

    @Test
    void cannotIssueWhenNoCopiesAvailable() {
        IssueRequest req1 = IssueRequest.builder().bookId(book.getId()).memberId(member.getId()).build();
        transactionService.issue(req1);

        MemberDto other = memberService.create(MemberRequest.builder()
                .name("Other").email("other@example.com").build());
        transactionService.issue(IssueRequest.builder().bookId(book.getId()).memberId(other.getId()).build());

        MemberDto third = memberService.create(MemberRequest.builder()
                .name("Third").email("third@example.com").build());

        assertThatThrownBy(() -> transactionService.issue(
                IssueRequest.builder().bookId(book.getId()).memberId(third.getId()).build()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("No copies");
    }

    @Test
    void returnRestoresAvailableCopies() {
        TransactionDto tx = transactionService.issue(
                IssueRequest.builder().bookId(book.getId()).memberId(member.getId()).build());
        TransactionDto returned = transactionService.returnBook(tx.getId());

        assertThat(returned.getStatus()).isEqualTo(TransactionStatus.RETURNED);
        assertThat(returned.getReturnedAt()).isNotNull();
        assertThat(bookService.getById(book.getId()).getAvailableCopies()).isEqualTo(2);
    }

    @Test
    void cannotReturnTwice() {
        TransactionDto tx = transactionService.issue(
                IssueRequest.builder().bookId(book.getId()).memberId(member.getId()).build());
        transactionService.returnBook(tx.getId());

        assertThatThrownBy(() -> transactionService.returnBook(tx.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already");
    }
}
