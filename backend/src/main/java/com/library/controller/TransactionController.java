package com.library.controller;

import com.library.dto.IssueRequest;
import com.library.dto.PageResponse;
import com.library.dto.TransactionDto;
import com.library.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @Operation(summary = "List transactions; bookSearch/memberSearch accept ID, name/title, ISBN, or email")
    public PageResponse<TransactionDto> list(@RequestParam(required = false) String bookSearch,
                                             @RequestParam(required = false) String memberSearch,
                                             @PageableDefault(size = 20) Pageable pageable) {
        return transactionService.list(bookSearch, memberSearch, pageable);
    }

    @PostMapping("/issue")
    @Operation(summary = "Issue a book to a member")
    public ResponseEntity<TransactionDto> issue(@Valid @RequestBody IssueRequest request) {
        TransactionDto tx = transactionService.issue(request);
        return ResponseEntity.created(URI.create("/v1/transactions/" + tx.getId())).body(tx);
    }

    @PostMapping("/{id}/return")
    @Operation(summary = "Return a previously issued book")
    public TransactionDto returnBook(@PathVariable Long id) {
        return transactionService.returnBook(id);
    }

    @PostMapping("/mark-overdue")
    @Operation(summary = "Sweep ISSUED transactions past due and mark them OVERDUE")
    public Map<String, Integer> markOverdue() {
        return Map.of("markedOverdue", transactionService.markOverdue());
    }
}
