package com.gct.banking_system.controller;

import com.gct.banking_system.dto.CreateTransactionRequest;
import com.gct.banking_system.dto.TransactionResponse;
import com.gct.banking_system.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts/{accountId}/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Create Transaction (DEPOSIT / WITHDRAW)
     * POST /api/accounts/{accountId}/transactions
     */
    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @PathVariable Long accountId,
            @Valid @RequestBody CreateTransactionRequest request) {

        TransactionResponse response = transactionService.createTransaction(accountId, request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get All Transactions for an Account
     * GET /api/accounts/{accountId}/transactions
     */
    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @PathVariable Long accountId) {

        return ResponseEntity.ok(transactionService.getTransactionsByAccountId(accountId));
    }
}
