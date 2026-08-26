package com.gct.banking_system.service;

import com.gct.banking_system.dto.BeneficiaryResponse;
import com.gct.banking_system.dto.CreateBeneficiaryRequest;
import com.gct.banking_system.dto.UpdateBeneficiaryRequest;
import com.gct.banking_system.entity.Beneficiary;
import com.gct.banking_system.entity.Customer;
import com.gct.banking_system.exception.DuplicateBeneficiaryException;
import com.gct.banking_system.exception.ResourceNotFoundException;
import com.gct.banking_system.repository.BeneficiaryRepository;
import com.gct.banking_system.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BeneficiaryServiceImpl implements BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final CustomerRepository customerRepository;

    @Override
    public BeneficiaryResponse createBeneficiary(CreateBeneficiaryRequest request) {

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found with id: " + request.getCustomerId()));

        if (beneficiaryRepository.existsByAccountNumberAndCustomerId(
                request.getAccountNumber(), request.getCustomerId())) {
            throw new DuplicateBeneficiaryException(
                    "Beneficiary already exists with account number: "
                            + request.getAccountNumber()
                            + " for customer id: "
                            + request.getCustomerId());
        }

        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setName(request.getName());
        beneficiary.setAccountNumber(request.getAccountNumber());
        beneficiary.setBankName(request.getBankName());
        beneficiary.setIfscCode(request.getIfscCode());
        beneficiary.setCustomer(customer);

        Beneficiary savedBeneficiary = beneficiaryRepository.save(beneficiary);

        return mapToResponse(savedBeneficiary);
    }

    @Override
    public List<BeneficiaryResponse> getAllBeneficiaries() {

        return beneficiaryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BeneficiaryResponse getBeneficiaryById(Long id) {

        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Beneficiary not found with id: " + id));

        return mapToResponse(beneficiary);
    }

    @Override
    public BeneficiaryResponse updateBeneficiary(Long id, UpdateBeneficiaryRequest request) {

        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Beneficiary not found with id: " + id));

        if (!beneficiary.getAccountNumber().equals(request.getAccountNumber())
                && beneficiaryRepository.existsByAccountNumberAndCustomerId(
                request.getAccountNumber(), beneficiary.getCustomer().getId())) {
            throw new DuplicateBeneficiaryException(
                    "Beneficiary already exists with account number: "
                            + request.getAccountNumber()
                            + " for customer id: "
                            + beneficiary.getCustomer().getId());
        }

        beneficiary.setName(request.getName());
        beneficiary.setAccountNumber(request.getAccountNumber());
        beneficiary.setBankName(request.getBankName());
        beneficiary.setIfscCode(request.getIfscCode());

        Beneficiary updatedBeneficiary = beneficiaryRepository.save(beneficiary);

        return mapToResponse(updatedBeneficiary);
    }

    @Override
    public void deleteBeneficiary(Long id) {

        Beneficiary beneficiary = beneficiaryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Beneficiary not found with id: " + id));

        beneficiaryRepository.delete(beneficiary);
    }

    private BeneficiaryResponse mapToResponse(Beneficiary beneficiary) {

        BeneficiaryResponse response = new BeneficiaryResponse();

        response.setId(beneficiary.getId());
        response.setName(beneficiary.getName());
        response.setAccountNumber(beneficiary.getAccountNumber());
        response.setBankName(beneficiary.getBankName());
        response.setIfscCode(beneficiary.getIfscCode());

        if (beneficiary.getCustomer() != null) {
            response.setCustomerId(beneficiary.getCustomer().getId());
            response.setCustomerName(beneficiary.getCustomer().getName());
        }

        return response;
    }
}
