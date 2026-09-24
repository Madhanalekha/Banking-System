package com.gct.banking_system.controller;

import com.gct.banking_system.dto.BeneficiaryResponse;
import com.gct.banking_system.dto.CreateBeneficiaryRequest;
import com.gct.banking_system.dto.UpdateBeneficiaryRequest;
import com.gct.banking_system.service.BeneficiaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
     * Requires authenticated user
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BeneficiaryResponse> createBeneficiary(
            @Valid @RequestBody CreateBeneficiaryRequest request) {

        BeneficiaryResponse response = beneficiaryService.createBeneficiary(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get All Beneficiaries
     * GET /api/beneficiaries
     * Requires authenticated user
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BeneficiaryResponse>> getAllBeneficiaries() {

        return ResponseEntity.ok(beneficiaryService.getAllBeneficiaries());
    }

    /**
     * Get Beneficiary By Id
     * GET /api/beneficiaries/{id}
     * Requires authenticated user
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BeneficiaryResponse> getBeneficiaryById(
            @PathVariable Long id) {

        return ResponseEntity.ok(beneficiaryService.getBeneficiaryById(id));
    }

    /**
     * Update Beneficiary
     * PUT /api/beneficiaries/{id}
     * Requires ADMIN or MAKER role
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'admin', 'MAKER', 'maker')")
    public ResponseEntity<BeneficiaryResponse> updateBeneficiary(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBeneficiaryRequest request) {

        return ResponseEntity.ok(beneficiaryService.updateBeneficiary(id, request));
    }

    /**
     * Delete Beneficiary
     * DELETE /api/beneficiaries/{id}
     * Requires ADMIN or CHECKER role
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'admin', 'CHECKER', 'checker')")
    public ResponseEntity<String> deleteBeneficiary(
            @PathVariable Long id) {

        beneficiaryService.deleteBeneficiary(id);

        return ResponseEntity.ok("Beneficiary deleted successfully.");
    }
}
