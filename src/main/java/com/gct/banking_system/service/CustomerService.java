package com.gct.banking_system.service;

import com.gct.banking_system.dto.CreateCustomerRequest;
import com.gct.banking_system.dto.UpdateCustomerRequest;
import com.gct.banking_system.dto.CustomerResponse;

import java.util.List;
public interface CustomerService {
    CustomerResponse createCustomer(CreateCustomerRequest request);

    List<CustomerResponse> getAllCustomers();

    CustomerResponse getCustomerById(Long id);

    CustomerResponse updateCustomer(Long id, UpdateCustomerRequest request);

    void deleteCustomer(Long id);
}
