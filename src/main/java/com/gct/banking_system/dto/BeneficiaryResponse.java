package com.gct.banking_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiaryResponse {

    private Long id;

    private String name;

    private String accountNumber;

    private String bankName;

    private String ifscCode;

    private Long customerId;

    private String customerName;

}
