package com.gct.banking_system.exception;

public class DuplicateCustomerException extends RuntimeException{
    public DuplicateCustomerException(String message) {
        super(message);
    }
}
