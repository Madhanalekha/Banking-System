package com.gct.banking_system.repository;
import com.gct.banking_system.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Find customer by email
    Optional<Customer> findByEmail(String email);

    // Check whether an email already exists
    boolean existsByEmail(String email);
}
