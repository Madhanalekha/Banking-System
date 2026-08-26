package com.gct.banking_system.service;

import com.gct.banking_system.dto.BeneficiaryResponse;
import com.gct.banking_system.dto.CreateBeneficiaryRequest;
import com.gct.banking_system.dto.UpdateBeneficiaryRequest;

import java.util.List;

public interface BeneficiaryService {

    BeneficiaryResponse createBeneficiary(CreateBeneficiaryRequest request);

    List<BeneficiaryResponse> getAllBeneficiaries();

    BeneficiaryResponse getBeneficiaryById(Long id);

    BeneficiaryResponse updateBeneficiary(Long id, UpdateBeneficiaryRequest request);

    void deleteBeneficiary(Long id);

}
