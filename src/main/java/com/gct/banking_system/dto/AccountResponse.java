package com.gct.banking_system.dto;

import com.gct.banking_system.entity.AccountType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountResponse {

    private Long id;

    private String accountNumber;

    private AccountType accountType;

    private Double balance;

    private Long customerId;

    private String customerName;

}