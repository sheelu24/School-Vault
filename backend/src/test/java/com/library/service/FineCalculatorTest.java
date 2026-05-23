package com.library.service;

import com.library.entity.Transaction;
import com.library.enums.TransactionStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;

class FineCalculatorTest {

    private final FineCalculator calculator = new FineCalculator(50);

    @Test
    void zeroFineBeforeDueDate() {
        Transaction tx = Transaction.builder()
                .dueDate(Instant.now().plus(2, ChronoUnit.DAYS))
                .status(TransactionStatus.ISSUED)
                .build();
        assertThat(calculator.compute(tx)).isZero();
    }

    @Test
    void chargesPerDayOverdue() {
        Instant due = Instant.now().minus(3, ChronoUnit.DAYS);
        Transaction tx = Transaction.builder()
                .dueDate(due)
                .returnedAt(Instant.now())
                .status(TransactionStatus.RETURNED)
                .build();
        assertThat(calculator.compute(tx)).isEqualTo(150);
    }

    @Test
    void unreturnedAccruesAgainstNow() {
        Instant due = Instant.now().minus(5, ChronoUnit.DAYS);
        Transaction tx = Transaction.builder()
                .dueDate(due)
                .status(TransactionStatus.OVERDUE)
                .build();
        assertThat(calculator.compute(tx)).isEqualTo(250);
    }
}
