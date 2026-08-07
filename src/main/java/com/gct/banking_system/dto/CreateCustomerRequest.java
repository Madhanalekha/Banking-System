package com.gct.banking_system.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
@Data
public class CreateCustomerRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @Pattern(regexp = "\\d{10}", message = "Phone number must contain exactly 10 digits")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;
}
