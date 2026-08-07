package com.gct.banking_system.dto;

import com.gct.banking_system.entity.AccountType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAccountRequest {

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @NotNull(message = "Balance is required")
    @Min(value = 0, message = "Balance cannot be negative")
    private Double balance;

    @NotNull(message = "Customer Id is required")
    private Long customerId;

}