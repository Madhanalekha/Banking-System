package com.gct.banking_system.dto;

import com.gct.banking_system.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long id;

    private Double amount;

    private TransactionType transactionType;

    private LocalDateTime transactionDate;

    private Long accountId;

    private String accountNumber;

}
