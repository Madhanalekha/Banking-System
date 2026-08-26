package com.gct.banking_system.controller;

import com.gct.banking_system.dto.BeneficiaryResponse;
import com.gct.banking_system.dto.CreateBeneficiaryRequest;
import com.gct.banking_system.dto.UpdateBeneficiaryRequest;
import com.gct.banking_system.service.BeneficiaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaries")
@RequiredArgsConstructor
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    /**
     * Create Beneficiary
     * POST /api/beneficiaries
     */
    @PostMapping
    public ResponseEntity<BeneficiaryResponse> createBeneficiary(
            @Valid @RequestBody CreateBeneficiaryRequest request) {

        BeneficiaryResponse response = beneficiaryService.createBeneficiary(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get All Beneficiaries
     * GET /api/beneficiaries
     */
    @GetMapping
    public ResponseEntity<List<BeneficiaryResponse>> getAllBeneficiaries() {

        return ResponseEntity.ok(beneficiaryService.getAllBeneficiaries());
    }

    /**
     * Get Beneficiary By Id
     * GET /api/beneficiaries/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<BeneficiaryResponse> getBeneficiaryById(
            @PathVariable Long id) {

        return ResponseEntity.ok(beneficiaryService.getBeneficiaryById(id));
    }

    /**
     * Update Beneficiary
     * PUT /api/beneficiaries/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<BeneficiaryResponse> updateBeneficiary(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBeneficiaryRequest request) {

        return ResponseEntity.ok(beneficiaryService.updateBeneficiary(id, request));
    }

    /**
     * Delete Beneficiary
     * DELETE /api/beneficiaries/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBeneficiary(
            @PathVariable Long id) {

        beneficiaryService.deleteBeneficiary(id);

        return ResponseEntity.ok("Beneficiary deleted successfully.");
    }
}
