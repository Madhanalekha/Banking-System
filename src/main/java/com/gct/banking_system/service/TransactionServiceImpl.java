package com.gct.banking_system.service;

import com.gct.banking_system.dto.CreateTransactionRequest;
import com.gct.banking_system.dto.TransactionResponse;
import com.gct.banking_system.entity.Account;
import com.gct.banking_system.entity.Transaction;
import com.gct.banking_system.entity.TransactionType;
import com.gct.banking_system.exception.InsufficientBalanceException;
import com.gct.banking_system.exception.ResourceNotFoundException;
import com.gct.banking_system.repository.AccountRepository;
import com.gct.banking_system.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public TransactionResponse createTransaction(Long accountId, CreateTransactionRequest request) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Account not found with id: " + accountId));

        if (request.getTransactionType() == TransactionType.DEPOSIT) {
            account.setBalance(account.getBalance() + request.getAmount());
        } else if (request.getTransactionType() == TransactionType.WITHDRAW) {
            if (account.getBalance() < request.getAmount()) {
                throw new InsufficientBalanceException(
                        "Insufficient balance for withdrawal. Current balance: "
                                + account.getBalance()
                                + ", requested amount: "
                                + request.getAmount());
            }
            account.setBalance(account.getBalance() - request.getAmount());
        }

        accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(request.getTransactionType());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setAccount(account);

        Transaction savedTransaction = transactionRepository.save(transaction);

        return mapToResponse(savedTransaction);
    }

    @Override
    public List<TransactionResponse> getTransactionsByAccountId(Long accountId) {

        if (!accountRepository.existsById(accountId)) {
            throw new ResourceNotFoundException(
                    "Account not found with id: " + accountId);
        }

        return transactionRepository.findByAccountId(accountId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private TransactionResponse mapToResponse(Transaction transaction) {

        TransactionResponse response = new TransactionResponse();

        response.setId(transaction.getId());
        response.setAmount(transaction.getAmount());
        response.setTransactionType(transaction.getTransactionType());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setAccountId(transaction.getAccount().getId());
        response.setAccountNumber(transaction.getAccount().getAccountNumber());

        return response;
    }
}
