package com.gct.banking_system.service;

import com.gct.banking_system.dto.AccountResponse;
import com.gct.banking_system.dto.CreateAccountRequest;
import com.gct.banking_system.dto.UpdateAccountRequest;
import com.gct.banking_system.entity.Account;
import com.gct.banking_system.entity.Customer;
import com.gct.banking_system.exception.DuplicateAccountException;
import com.gct.banking_system.exception.ResourceNotFoundException;
import com.gct.banking_system.repository.AccountRepository;
import com.gct.banking_system.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;

    @Override
    public AccountResponse createAccount(CreateAccountRequest request) {

        if (accountRepository.existsByAccountNumber(request.getAccountNumber())) {
            throw new DuplicateAccountException(
                    "Account already exists with account number: "
                            + request.getAccountNumber());
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found with id: "
                                        + request.getCustomerId()));

        Account account = new Account();

        account.setAccountNumber(request.getAccountNumber());
        account.setAccountType(request.getAccountType());
        account.setBalance(request.getBalance());
        account.setCustomer(customer);

        Account savedAccount = accountRepository.save(account);

        return mapToResponse(savedAccount);
    }

    @Override
    public List<AccountResponse> getAllAccounts() {

        return accountRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AccountResponse getAccountById(Long id) {

        Account account = accountRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Account not found with id: " + id));

        return mapToResponse(account);
    }

    @Override
    public AccountResponse updateAccount(Long id,
                                         UpdateAccountRequest request) {

        Account account = accountRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Account not found with id: " + id));

        account.setAccountType(request.getAccountType());
        account.setBalance(request.getBalance());

        Account updatedAccount = accountRepository.save(account);

        return mapToResponse(updatedAccount);
    }

    @Override
    public void deleteAccount(Long id) {

        Account account = accountRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Account not found with id: " + id));

        accountRepository.delete(account);
    }

    /**
     * Convert Entity to Response DTO
     */
    private AccountResponse mapToResponse(Account account) {

        AccountResponse response = new AccountResponse();

        response.setId(account.getId());
        response.setAccountNumber(account.getAccountNumber());
        response.setAccountType(account.getAccountType());
        response.setBalance(account.getBalance());

        response.setCustomerId(account.getCustomer().getId());
        response.setCustomerName(account.getCustomer().getName());

        return response;
    }
}