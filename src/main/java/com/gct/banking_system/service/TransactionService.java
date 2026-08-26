package com.gct.banking_system.service;

import com.gct.banking_system.dto.CreateTransactionRequest;
import com.gct.banking_system.dto.TransactionResponse;

import java.util.List;

public interface TransactionService {

    TransactionResponse createTransaction(Long accountId, CreateTransactionRequest request);

    List<TransactionResponse> getTransactionsByAccountId(Long accountId);

}
