package com.gct.banking_system.service;

import com.gct.banking_system.dto.AccountResponse;
import com.gct.banking_system.dto.CreateAccountRequest;
import com.gct.banking_system.dto.UpdateAccountRequest;

import java.util.List;

public interface AccountService {

    AccountResponse createAccount(CreateAccountRequest request);

    List<AccountResponse> getAllAccounts();

    AccountResponse getAccountById(Long id);

    AccountResponse updateAccount(Long id, UpdateAccountRequest request);

    void deleteAccount(Long id);

}