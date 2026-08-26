# GCT Banking System

A robust, enterprise-ready **Spring Boot Banking REST API** developed as part of the **GCT Training Program**. The system provides comprehensive banking operations including Customer Management, Account Management, Transaction Processing (Deposits & Withdrawals with balance consistency and audit logs), and Beneficiary Management.

---

## Table of Contents
1. [Overview & Features](#overview--features)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design Principles](#architecture--design-principles)
4. [Project Structure](#project-structure)
5. [Database Design & Entity Relationships](#database-design--entity-relationships)
6. [API Documentation & Endpoints](#api-documentation--endpoints)
7. [Setup & Execution Guide](#setup--execution-guide)
8. [Postman Testing Guide (21 Test Scenarios)](#postman-testing-guide-21-test-scenarios)
9. [Exception Handling & Validation](#exception-handling--validation)
10. [Banking Ledger & Account Balance Design](#banking-ledger--account-balance-design)
11. [Git Disciplines & Commit History](#git-disciplines--commit-history)
12. [Future Improvements](#future-improvements)

---

## Overview & Features

The **GCT Banking System** is designed with standard enterprise software engineering practices following layered architecture (Controller $\to$ Service $\to$ Repository), strict separation of concerns, complete encapsulation of entity persistence using Data Transfer Objects (DTOs), and centralized exception handling.

### Core Features:
- **System Monitoring**: Liveness, database connectivity status (`/health/db`), and metadata APIs.
- **Customer Management**: Full CRUD operations with uniqueness constraints on email.
- **Account Management**: Create and manage savings/current accounts linked to registered customers.
- **Transaction Processing**:
  - **Deposit**: Adds funds to account balance, logs timestamped transaction.
  - **Withdrawal**: Verifies sufficient funds, deducts balance safely, or rejects with `InsufficientBalanceException`.
  - **Audit History**: Retrieve complete chronologically ordered ledger for any account.
- **Beneficiary Management**: Create and manage transfer beneficiaries linked to customers, preventing duplicate beneficiary accounts per customer.
- **Input Validation**: Standardized Jakarta Bean Validation with descriptive error messages.
- **Centralized Error Handling**: Standardized HTTP status codes (200, 201, 400, 404, 409, 500) and structured JSON error responses.

---

## Technology Stack

- **Java**: 17 (LTS)
- **Framework**: Spring Boot 4.0.x / 3.x (Spring WebMVC, Spring Data JPA)
- **Database**: PostgreSQL
- **ORM / Persistence**: Hibernate / JPA
- **Boilerplate Reduction**: Project Lombok
- **Validation**: Jakarta Validation API & Hibernate Validator
- **Build Tool**: Apache Maven (Maven Wrapper included)
- **API Testing**: Postman

---

## Architecture & Design Principles

```
┌─────────────────────────────────────────────────────────────┐
│                      Client / Postman                       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP JSON Request / Response
┌──────────────────────────────▼──────────────────────────────┐
│                     Controller Layer                        │
│   (CustomerController, AccountController,                   │
│    TransactionController, BeneficiaryController,            │
│    SystemController)                                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ DTOs (Validated by @Valid)
┌──────────────────────────────▼──────────────────────────────┐
│                       Service Layer                         │
│   (CustomerService, AccountService,                         │
│    TransactionService, BeneficiaryService)                  │
│    * Contains business rules, balance validations, mapping  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Entities (JPA Model)
┌──────────────────────────────▼──────────────────────────────┐
│                     Repository Layer                        │
│   (CustomerRepository, AccountRepository,                   │
│    TransactionRepository, BeneficiaryRepository)            │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQL / JDBC
┌──────────────────────────────▼──────────────────────────────┐
│                    PostgreSQL Database                      │
│   (customers, accounts, transactions, beneficiaries)        │
└─────────────────────────────────────────────────────────────┘
```

- **Constructor Injection**: All dependencies are injected via constructor using Lombok's `@RequiredArgsConstructor`.
- **DTO Encapsulation**: Domain entities (`Customer`, `Account`, `Transaction`, `Beneficiary`) are never directly returned over HTTP; DTOs decouple internal schema from client contracts and eliminate circular serialization issues.
- **Transaction Atomicity**: Financial operations in `TransactionServiceImpl` are annotated with `@Transactional` to guarantee ACID guarantees.

---

## Project Structure

```
com.gct.banking_system
├── BankingSystemApplication.java
├── controller
│   ├── AccountController.java
│   ├── BeneficiaryController.java
│   ├── CustomerController.java
│   ├── SystemController.java
│   └── TransactionController.java
├── dto
│   ├── AccountResponse.java
│   ├── BeneficiaryResponse.java
│   ├── CreateAccountRequest.java
│   ├── CreateBeneficiaryRequest.java
│   ├── CreateCustomerRequest.java
│   ├── CreateTransactionRequest.java
│   ├── CustomerResponse.java
│   ├── TransactionResponse.java
│   ├── UpdateAccountRequest.java
│   ├── UpdateBeneficiaryRequest.java
│   └── UpdateCustomerRequest.java
├── entity
│   ├── Account.java
│   ├── AccountType.java
│   ├── Beneficiary.java
│   ├── Customer.java
│   ├── Transaction.java
│   └── TransactionType.java
├── exception
│   ├── ApiError.java
│   ├── DuplicateAccountException.java
│   ├── DuplicateBeneficiaryException.java
│   ├── DuplicateCustomerException.java
│   ├── GlobalExceptionHandler.java
│   ├── InsufficientBalanceException.java
│   └── ResourceNotFoundException.java
├── repository
│   ├── AccountRepository.java
│   ├── BeneficiaryRepository.java
│   ├── CustomerRepository.java
│   └── TransactionRepository.java
└── service
    ├── AccountService.java
    ├── AccountServiceImpl.java
    ├── BeneficiaryService.java
    ├── BeneficiaryServiceImpl.java
    ├── CustomerService.java
    ├── CustomerServiceImpl.java
    ├── DatabaseStatusService.java
    ├── TransactionService.java
    └── TransactionServiceImpl.java
```

---

## Database Design & Entity Relationships

```
┌─────────────────┐       1 : N       ┌─────────────────┐       1 : N       ┌─────────────────┐
│    Customer     ├──────────────────►│     Account     ├──────────────────►│   Transaction   │
├─────────────────┤                   ├─────────────────┤                   ├─────────────────┤
│ id (PK)         │                   │ id (PK)         │                   │ id (PK)         │
│ name            │                   │ account_number  │                   │ amount          │
│ email (UQ)      │                   │ account_type    │                   │ transaction_type│
│ phone           │                   │ balance         │                   │ transaction_date│
│ address         │                   │ customer_id(FK) │                   │ account_id (FK) │
└────────┬────────┘                   └─────────────────┘                   └─────────────────┘
         │
         │ 1 : N
         ▼
┌─────────────────┐
│   Beneficiary   │
├─────────────────┤
│ id (PK)         │
│ name            │
│ account_number  │
│ bank_name       │
│ ifsc_code       │
│ customer_id(FK) │
└─────────────────┘
```

### Relationship Mappings:
1. **Customer $\longleftrightarrow$ Account (1 : N)**: One customer can hold multiple accounts. Mapped via `@ManyToOne` in `Account` and `@OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)` in `Customer`.
2. **Account $\longleftrightarrow$ Transaction (1 : N)**: An account has a history of deposits and withdrawals. Mapped via `@ManyToOne` in `Transaction` and `@OneToMany(mappedBy = "account", cascade = CascadeType.ALL)` in `Account`.
3. **Customer $\longleftrightarrow$ Beneficiary (1 : N)**: A customer can add multiple third-party transfer beneficiaries. Mapped via `@ManyToOne` in `Beneficiary` and `@OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)` in `Customer`.

---

## API Documentation & Endpoints

### 1. System Health & Info
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Application status | 200 OK |
| `GET` | `/health/db` | PostgreSQL connection status | 200 OK |
| `GET` | `/info` | Application and runtime info | 200 OK |

### 2. Customer APIs
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/customers` | Register a new customer | 201 Created |
| `GET` | `/api/customers` | Retrieve all customers | 200 OK |
| `GET` | `/api/customers/{id}` | Get customer by ID | 200 OK |
| `PUT` | `/api/customers/{id}` | Update customer details | 200 OK |
| `DELETE` | `/api/customers/{id}` | Delete customer by ID | 200 OK |

### 3. Account APIs
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/accounts` | Create account for a customer | 201 Created |
| `GET` | `/api/accounts` | Retrieve all accounts | 200 OK |
| `GET` | `/api/accounts/{id}` | Get account by ID | 200 OK |
| `PUT` | `/api/accounts/{id}` | Update account | 200 OK |
| `DELETE` | `/api/accounts/{id}` | Delete account by ID | 200 OK |

### 4. Transaction APIs
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/accounts/{accountId}/transactions` | Deposit or Withdraw money | 201 Created |
| `GET` | `/api/accounts/{accountId}/transactions` | Get account transaction history | 200 OK |

### 5. Beneficiary APIs
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/beneficiaries` | Add a beneficiary for a customer | 201 Created |
| `GET` | `/api/beneficiaries` | Retrieve all beneficiaries | 200 OK |
| `GET` | `/api/beneficiaries/{id}` | Get beneficiary by ID | 200 OK |
| `PUT` | `/api/beneficiaries/{id}` | Update beneficiary details | 200 OK |
| `DELETE` | `/api/beneficiaries/{id}` | Delete beneficiary by ID | 200 OK |

---

## Setup & Execution Guide

### 1. Prerequisites
- Java Development Kit (JDK 17)
- PostgreSQL 12+ running locally or in Docker
- Maven (or use bundled `./mvnw`)

### 2. PostgreSQL Configuration
Ensure a database named `banking_db` exists in PostgreSQL:
```sql
CREATE DATABASE banking_db;
```

Update credentials in `src/main/resources/application.yml` if necessary:
```yaml
spring:
  application:
    name: banking-system

  datasource:
    url: jdbc:postgresql://localhost:5432/banking_db
    username: postgres
    password: postgres123
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

### 3. Build & Run Application
Using Maven wrapper:
```bash
# Clean & Compile
./mvnw clean compile

# Run Spring Boot Application
./mvnw spring-boot:run
```
The application will start on port `8080` (`http://localhost:8080`).

---

## Postman Testing Guide (21 Test Scenarios)

### Scenario 1: Create Customer
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/customers`
- **Body**:
```json
{
  "name": "Madhan",
  "email": "madhan@example.com",
  "phone": "9876543210",
  "address": "123 Anna Nagar, Chennai"
}
```
- **Status**: `201 Created`
- **Expected Response**:
```json
{
  "id": 1,
  "name": "Madhan",
  "email": "madhan@example.com",
  "phone": "9876543210",
  "address": "123 Anna Nagar, Chennai"
}
```

---

### Scenario 2: Get All Customers
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/customers`
- **Status**: `200 OK`
- **Expected Response**: `List<CustomerResponse>` containing Customer 1.

---

### Scenario 3: Get Customer by ID
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/customers/1`
- **Status**: `200 OK`
- **Expected Response**: JSON object for customer ID 1.

---

### Scenario 4: Update Customer
- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/customers/1`
- **Body**:
```json
{
  "name": "Madhan Kumar",
  "email": "madhankumar@example.com",
  "phone": "9876543210",
  "address": "456 Gandhi Road, Coimbatore"
}
```
- **Status**: `200 OK`
- **Expected Response**: Updated customer details.

---

### Scenario 5: Create Account
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/accounts`
- **Body**:
```json
{
  "accountNumber": "ACC100001",
  "accountType": "SAVINGS",
  "balance": 5000.0,
  "customerId": 1
}
```
- **Status**: `201 Created`
- **Expected Response**:
```json
{
  "id": 1,
  "accountNumber": "ACC100001",
  "accountType": "SAVINGS",
  "balance": 5000.0,
  "customerId": 1,
  "customerName": "Madhan Kumar"
}
```

---

### Scenario 6: Get All Accounts
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/accounts`
- **Status**: `200 OK`
- **Expected Response**: Array of accounts containing Account ID 1.

---

### Scenario 7: Create Deposit Transaction
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/accounts/1/transactions`
- **Body**:
```json
{
  "amount": 2500.0,
  "transactionType": "DEPOSIT"
}
```
- **Status**: `201 Created`
- **Expected Response**:
```json
{
  "id": 1,
  "amount": 2500.0,
  "transactionType": "DEPOSIT",
  "transactionDate": "2026-08-22T21:30:00.000",
  "accountId": 1,
  "accountNumber": "ACC100001"
}
```

---

### Scenario 8: Verify Account Balance Increased
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/accounts/1`
- **Status**: `200 OK`
- **Expected Response**: `balance` equals `7500.0` ($5000 + 2500$).

---

### Scenario 9: Create Withdrawal Transaction
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/accounts/1/transactions`
- **Body**:
```json
{
  "amount": 1500.0,
  "transactionType": "WITHDRAW"
}
```
- **Status**: `201 Created`
- **Expected Response**:
```json
{
  "id": 2,
  "amount": 1500.0,
  "transactionType": "WITHDRAW",
  "transactionDate": "2026-08-22T21:31:00.000",
  "accountId": 1,
  "accountNumber": "ACC100001"
}
```

---

### Scenario 10: Verify Account Balance Decreased
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/accounts/1`
- **Status**: `200 OK`
- **Expected Response**: `balance` equals `6000.0` ($7500 - 1500$).

---

### Scenario 11: Try Withdrawal Greater Than Balance
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/accounts/1/transactions`
- **Body**:
```json
{
  "amount": 100000.0,
  "transactionType": "WITHDRAW"
}
```
- **Status**: `400 Bad Request`
- **Expected Response**:
```json
{
  "timestamp": "2026-08-22T21:32:00.000",
  "status": 400,
  "error": "Bad Request",
  "message": "Insufficient balance for withdrawal. Current balance: 6000.0, requested amount: 100000.0",
  "path": "/api/accounts/1/transactions"
}
```

---

### Scenario 12: Get Account Transaction History
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/accounts/1/transactions`
- **Status**: `200 OK`
- **Expected Response**: Array of 2 transactions (Deposit 2500.0, Withdraw 1500.0).

---

### Scenario 13: Create Beneficiary
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/beneficiaries`
- **Body**:
```json
{
  "name": "Rahul Sharma",
  "accountNumber": "ACC200001",
  "bankName": "State Bank of India",
  "ifscCode": "SBIN0001234",
  "customerId": 1
}
```
- **Status**: `201 Created`
- **Expected Response**:
```json
{
  "id": 1,
  "name": "Rahul Sharma",
  "accountNumber": "ACC200001",
  "bankName": "State Bank of India",
  "ifscCode": "SBIN0001234",
  "customerId": 1,
  "customerName": "Madhan Kumar"
}
```

---

### Scenario 14: Get All Beneficiaries
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/beneficiaries`
- **Status**: `200 OK`
- **Expected Response**: Array containing Beneficiary ID 1.

---

### Scenario 15: Update Beneficiary
- **Method**: `PUT`
- **URL**: `http://localhost:8080/api/beneficiaries/1`
- **Body**:
```json
{
  "name": "Rahul S",
  "accountNumber": "ACC200001",
  "bankName": "HDFC Bank",
  "ifscCode": "HDFC0004321"
}
```
- **Status**: `200 OK`
- **Expected Response**: Updated beneficiary details.

---

### Scenario 16: Delete Beneficiary
- **Method**: `DELETE`
- **URL**: `http://localhost:8080/api/beneficiaries/1`
- **Status**: `200 OK`
- **Expected Response**: `"Beneficiary deleted successfully."`

---

### Scenario 17: Test Invalid Request Validation
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/customers`
- **Body**:
```json
{
  "name": "",
  "email": "invalid-email",
  "phone": "123",
  "address": ""
}
```
- **Status**: `400 Bad Request`
- **Expected Response**:
```json
{
  "name": "Name is required",
  "email": "Invalid email format",
  "phone": "Phone number must contain exactly 10 digits",
  "address": "Address is required"
}
```

---

### Scenario 18: Test Non-Existent Customer
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/customers/999`
- **Status**: `404 Not Found`
- **Expected Response**:
```json
{
  "timestamp": "2026-08-22T21:35:00.000",
  "status": 404,
  "error": "Not Found",
  "message": "Customer not found with id: 999",
  "path": "/api/customers/999"
}
```

---

### Scenario 19: Test Non-Existent Account
- **Method**: `GET`
- **URL**: `http://localhost:8080/api/accounts/999`
- **Status**: `404 Not Found`
- **Expected Response**:
```json
{
  "timestamp": "2026-08-22T21:36:00.000",
  "status": 404,
  "error": "Not Found",
  "message": "Account not found with id: 999",
  "path": "/api/accounts/999"
}
```

---

### Scenario 20: Test Duplicate Account Number
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/accounts`
- **Body**:
```json
{
  "accountNumber": "ACC100001",
  "accountType": "SAVINGS",
  "balance": 1000.0,
  "customerId": 1
}
```
- **Status**: `409 Conflict`
- **Expected Response**:
```json
{
  "timestamp": "2026-08-22T21:37:00.000",
  "status": 409,
  "error": "Conflict",
  "message": "Account already exists with account number: ACC100001",
  "path": "/api/accounts"
}
```

---

### Scenario 21: Test Duplicate Beneficiary
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/beneficiaries`
- **Body**:
```json
{
  "name": "Priya",
  "accountNumber": "ACC200001",
  "bankName": "ICICI Bank",
  "ifscCode": "ICIC0009999",
  "customerId": 1
}
```
(When beneficiary with `ACC200001` already belongs to Customer 1)
- **Status**: `409 Conflict`
- **Expected Response**:
```json
{
  "timestamp": "2026-08-22T21:38:00.000",
  "status": 409,
  "error": "Conflict",
  "message": "Beneficiary already exists with account number: ACC200001 for customer id: 1",
  "path": "/api/beneficiaries"
}
```

---

## Exception Handling & Validation

All exceptions thrown across the application are intercepted by `GlobalExceptionHandler`:

| Exception | HTTP Status | Response Format |
| :--- | :--- | :--- |
| `ResourceNotFoundException` | `404 Not Found` | `ApiError` (JSON) |
| `DuplicateCustomerException` | `409 Conflict` | `ApiError` (JSON) |
| `DuplicateAccountException` | `409 Conflict` | `ApiError` (JSON) |
| `DuplicateBeneficiaryException` | `409 Conflict` | `ApiError` (JSON) |
| `InsufficientBalanceException` | `400 Bad Request` | `ApiError` (JSON) |
| `MethodArgumentNotValidException` | `400 Bad Request` | `Map<String, String>` (Field $\to$ Error message) |
| `Exception` (Unhandled / Internal) | `500 Internal Server Error` | `ApiError` (JSON) |

---

## Banking Ledger & Account Balance Design

### Real-world Banking Principle:
In production banking software, balance is a **computed or transaction-locked state** that should **never** be arbitrarily altered via an update endpoint. Every balance change must correspond to an immutable credit or debit transaction entry with an audit log.

### Current Implementation & Recommendations:
- **Transaction-Driven Mutation**: In this system, all funds deposits and withdrawals are executed via `/api/accounts/{accountId}/transactions`. The service layer updates the balance atomically inside a `@Transactional` block.
- **Account Update API (`PUT /api/accounts/{id}`)**: For student training and backward compatibility with previous test suites, `UpdateAccountRequest` retains the fields configured during initial development. In a production deployment, `balance` should be removed from `UpdateAccountRequest`, permitting updates only to account configuration attributes (e.g. `accountType`, `status`) to avoid bypassing transaction ledgers.

---

## Git Disciplines & Commit History

Recommended commit discipline for project evolution:

1. `feat: implement customer CRUD APIs`
2. `feat: implement account CRUD APIs`
3. `feat: add system health and database monitoring APIs`
4. `feat: add global exception handling and bean validation`
5. `feat: implement transaction module with deposit and withdrawal ledger`
6. `feat: implement beneficiary module with duplicate prevention`
7. `test: add comprehensive 21-scenario Postman API test suite`
8. `docs: add professional project README documentation`

---

## Future Improvements

- **Account Transfer API**: Implement inter-account fund transfers (`/api/transfers`) with transactional rollbacks.
- **Pagination & Sorting**: Add Spring Data `Pageable` support on `getAllCustomers`, `getAllAccounts`, and transaction history queries.
- **Security & Authentication**: Integrate Spring Security with JWT (JSON Web Tokens) or OAuth2 / Keycloak for role-based access control (Admin vs Customer).
- **Audit Logging**: Implement Hibernate Envers or Spring Data JPA Auditing (`@CreatedDate`, `@LastModifiedDate`).

---

## Author
**Madhanalekha L**  
*Government College of Technology (GCT)*  
*Department of Computer Science and Engineering*