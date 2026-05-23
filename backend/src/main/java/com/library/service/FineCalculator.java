package com.library.service;

import com.library.entity.Transaction;
import com.library.enums.TransactionStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
public class FineCalculator {

    private final long perDayCents;

    public FineCalculator(@Value("${library.fine.per-day-cents:50}") long perDayCents) {
        this.perDayCents = perDayCents;
    }

    public long compute(Transaction tx) {
        if (tx.getStatus() == TransactionStatus.RETURNED) {
            Instant end = tx.getReturnedAt();
            if (end == null) return 0;
            return overdueDays(tx.getDueDate(), end) * perDayCents;
        }
        return overdueDays(tx.getDueDate(), Instant.now()) * perDayCents;
    }

    private long overdueDays(Instant due, Instant end) {
        if (end.isBefore(due)) return 0;
        long seconds = Duration.between(due, end).getSeconds();
        return (seconds + 86_399) / 86_400;
    }
}
