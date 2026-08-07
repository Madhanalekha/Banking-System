package com.gct.banking_system.controller;

import com.gct.banking_system.dto.AccountResponse;
import com.gct.banking_system.dto.CreateAccountRequest;
import com.gct.banking_system.dto.UpdateAccountRequest;
import com.gct.banking_system.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    /**
     * Create Account
     */
    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody CreateAccountRequest request) {

        AccountResponse response = accountService.createAccount(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get All Accounts
     */
    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAllAccounts() {

        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    /**
     * Get Account By Id
     */
    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccountById(
            @PathVariable Long id) {

        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    /**
     * Update Account
     */
    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAccountRequest request) {

        return ResponseEntity.ok(
                accountService.updateAccount(id, request));
    }

    /**
     * Delete Account
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAccount(
            @PathVariable Long id) {

        accountService.deleteAccount(id);

        return ResponseEntity.ok("Account deleted successfully.");
    }

}