package com.gct.banking_system.controller;

import com.gct.banking_system.dto.CreateCustomerRequest;
import com.gct.banking_system.dto.CustomerResponse;
import com.gct.banking_system.dto.UpdateCustomerRequest;
import com.gct.banking_system.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /**
     * Create Customer
     * POST /api/customers
     */
    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(
            @Valid @RequestBody CreateCustomerRequest request) {

        CustomerResponse response = customerService.createCustomer(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get All Customers
     * GET /api/customers
     */
    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {

        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    /**
     * Get Customer By Id
     * GET /api/customers/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    /**
     * Update Customer
     * PUT /api/customers/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerRequest request) {

        return ResponseEntity.ok(
                customerService.updateCustomer(id, request));
    }

    /**
     * Delete Customer
     * DELETE /api/customers/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCustomer(
            @PathVariable Long id) {

        customerService.deleteCustomer(id);

        return ResponseEntity.ok("Customer deleted successfully.");
    }
}