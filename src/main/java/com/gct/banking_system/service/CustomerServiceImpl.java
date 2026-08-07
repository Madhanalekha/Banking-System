package com.gct.banking_system.service;


import com.gct.banking_system.dto.CreateCustomerRequest;
import com.gct.banking_system.dto.CustomerResponse;
import com.gct.banking_system.dto.UpdateCustomerRequest;
import com.gct.banking_system.entity.Customer;
import com.gct.banking_system.exception.DuplicateCustomerException;
import com.gct.banking_system.exception.ResourceNotFoundException;
import com.gct.banking_system.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public CustomerResponse createCustomer(CreateCustomerRequest request) {

        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateCustomerException(
                    "Customer already exists with email: " + request.getEmail());
        }

        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());

        Customer savedCustomer = customerRepository.save(customer);

        return mapToResponse(savedCustomer);
    }

    @Override
    public List<CustomerResponse> getAllCustomers() {

        return customerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CustomerResponse getCustomerById(Long id) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found with id: " + id));

        return mapToResponse(customer);
    }

    @Override
    public CustomerResponse updateCustomer(Long id, UpdateCustomerRequest request) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found with id: " + id));

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());

        Customer updatedCustomer = customerRepository.save(customer);

        return mapToResponse(updatedCustomer);
    }

    @Override
    public void deleteCustomer(Long id) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found with id: " + id));

        customerRepository.delete(customer);
    }

    private CustomerResponse mapToResponse(Customer customer) {

        CustomerResponse response = new CustomerResponse();

        response.setId(customer.getId());
        response.setName(customer.getName());
        response.setEmail(customer.getEmail());
        response.setPhone(customer.getPhone());
        response.setAddress(customer.getAddress());

        return response;
    }
}