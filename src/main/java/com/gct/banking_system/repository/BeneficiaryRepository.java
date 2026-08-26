package com.gct.banking_system.repository;

import com.gct.banking_system.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {

    List<Beneficiary> findByCustomerId(Long customerId);

    boolean existsByAccountNumberAndCustomerId(String accountNumber, Long customerId);

}
