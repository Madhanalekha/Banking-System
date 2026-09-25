# Banking System

A robust, enterprise-ready **Spring Boot Banking REST API** developed as part of the **GCT Training Program**. The system provides comprehensive banking operations including Customer Management, Account Management, Transaction Processing (Deposits & Withdrawals with balance consistency and audit logs), and Beneficiary Management.

---

### Table of Contents
1. [Overview & Features](#overview--features)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design Principles](#architecture--design-principles)
4. [Security & Role-Based Access Control (RBAC)](#security--role-based-access-control-rbac)
5. [Keycloak Setup & Configuration Guide](#keycloak-setup--configuration-guide)
6. [Project Structure](#project-structure)
7. [Database Design & Entity Relationships](#database-design--entity-relationships)
8. [API Documentation & Endpoints](#api-documentation--endpoints)
9. [Setup & Execution Guide](#setup--execution-guide)
10. [Frontend Web Application (Next.js)](#frontend-web-application-nextjs)
11. [Postman & Token Testing Guide](#postman--token-testing-guide)
12. [Exception Handling & Validation](#exception-handling--validation)
13. [Banking Ledger & Account Balance Design](#banking-ledger--account-balance-design)
14. [Git Disciplines & Commit History](#git-disciplines--commit-history)
15. [Future Improvements](#future-improvements)

---

## Overview & Features

The **GCT Banking System** is designed with standard enterprise software engineering practices following layered architecture (Controller $\to$ Service $\to$ Repository), strict separation of concerns, complete encapsulation of entity persistence using Data Transfer Objects (DTOs), centralized exception handling, and **production-ready OAuth2 / OpenID Connect security with Keycloak**.

### Core Features:
- **Enterprise Security & Identity**:
  - Keycloak OpenID Connect / OAuth2 Resource Server integration.
  - JWT token verification via Keycloak JWK set (`/protocol/openid-connect/certs`).
  - Granular **Role-Based Access Control (RBAC)** across `ADMIN`, `MAKER`, and `CHECKER` roles.
  - Double-layered protection: Filter-chain URL security rules + method-level `@PreAuthorize` annotations.
- **System Monitoring**: Liveness, database connectivity status (`/health/db`), and runtime metadata APIs.
- **Customer Management**: Full CRUD operations with uniqueness constraints on email.
- **Account Management**: Create and manage savings/current accounts linked to registered customers.
- **Transaction Processing**:
  - **Deposit**: Adds funds to account balance, logs timestamped transaction ledger.
  - **Withdrawal**: Verifies sufficient funds, deducts balance atomically, or rejects with `InsufficientBalanceException`.
  - **Audit History**: Retrieve complete chronologically ordered ledger for any account.
- **Beneficiary Management**: Create and manage transfer beneficiaries linked to customers, preventing duplicate beneficiary accounts per customer.
- **Next.js Web Portal**: Modern React frontend with Keycloak authentication flow, dark mode aesthetics, dashboard KPIs, and role-based UI views.
- **Input Validation**: Standardized Jakarta Bean Validation with descriptive error messages.
- **Centralized Error Handling**: Standardized HTTP status codes (200, 201, 400, 401, 403, 404, 409, 500) and structured JSON error responses.

---

## Technology Stack

### Backend
- **Java**: 17 (LTS)
- **Framework**: Spring Boot 4.0.x / 3.x (Spring WebMVC, Spring Data JPA)
- **Security**: Spring Security, Spring Boot OAuth2 Resource Server (JWT)
- **Identity & Access Management (IAM)**: Keycloak 24+ (OAuth2 / OIDC)
- **Database**: PostgreSQL 12+
- **ORM / Persistence**: Hibernate / JPA
- **Boilerplate Reduction**: Project Lombok
- **Validation**: Jakarta Validation API & Hibernate Validator
- **Build Tool**: Apache Maven (Maven Wrapper included)

### Frontend
- **Framework**: Next.js 15+ (App Router), React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: OIDC OAuth2 Authorization Code Flow with PKCE via Keycloak

### DevOps & Tooling
- **Containers**: Docker & Docker Compose (PostgreSQL & Keycloak)
- **API Testing**: Postman & cURL

---

## Architecture & Design Principles

```
┌────────────────────────────────────────────────────────┐
│               Keycloak IAM (Port 8081)                 │
│        Realm: bank-app | Client: bank-app              │
└───────────────────────────┬────────────────────────────┘
                            │ 1. User Authentication
                            │ 2. Issue JWT (Roles: ADMIN, MAKER, CHECKER, USER)
                            ▼
┌────────────────────────────────────────────────────────┐
│           Next.js Frontend (Port 3000)                 │
│        (Token Storage & Bearer Header Injection)       │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP Requests with Bearer JWT
┌───────────────────────────▼────────────────────────────┐
│          Spring Boot Resource Server (Port 8080)       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ SecurityFilterChain (Stateless, CORS, 401/403)   │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           │                            │
│  ┌────────────────────────▼─────────────────────────┐  │
│  │ JwtAuthConverter (Extracts realm & client roles) │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           │                            │
│  ┌────────────────────────▼─────────────────────────┐  │
│  │ Controller Layer (@PreAuthorize Role Security)   │  │
│  │ (Account, Customer, Transaction, Beneficiary)    │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           │ DTOs                       │
│  ┌────────────────────────▼─────────────────────────┐  │
│  │ Service Layer (@Transactional Business Logic)    │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           │ Entities                   │
│  ┌────────────────────────▼─────────────────────────┐  │
│  │ Repository Layer (Spring Data JPA)               │  │
│  └────────────────────────┬─────────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            │ SQL / JDBC
┌───────────────────────────▼────────────────────────────┐
│                 PostgreSQL Database                    │
│   (customers, accounts, transactions, beneficiaries)   │
└────────────────────────────────────────────────────────┘
```

- **Stateless Authentication**: No HTTP sessions are stored on the server (`SessionCreationPolicy.STATELESS`); each request is authenticated through an asymmetric signature check of the Keycloak JWT using public JWK certs.
- **Double Defense-in-Depth**: Both URL pattern matching in `SecurityFilterChain` AND method-level `@PreAuthorize` enforce role requirements.
- **DTO Encapsulation**: Domain entities are decoupled from HTTP contracts to avoid circular references and over-posting.
- **ACID Financial Transactions**: Balance modifications run inside `@Transactional` blocks to ensure strict ledger consistency.

---

## Security & Role-Based Access Control (RBAC)

### 1. User Roles & Banking Responsibilities

| Role | Keycloak Role Name | Responsibilities / Permissions |
| :--- | :--- | :--- |
| **Admin** | `admin` / `ADMIN` | Full administrative control: Create, update, delete accounts; delete customers; update/delete beneficiaries; system health. |
| **Maker** | `maker` / `MAKER` | Operational branch maker: Create accounts, create customers, execute financial transactions (Deposit / Withdraw), add beneficiaries. |
| **Checker** | `checker` / `CHECKER` | Supervisory auditor: Audit and verify accounts and customers; review/delete beneficiaries; read audit ledgers. |


### 2. Role-Based Permissions Matrix

| Endpoint | HTTP Method | Allowed Roles / Auth Level | Description |
| :--- | :--- | :--- | :--- |
| `/health/**`, `/info` | `GET` | Public (`permitAll`) | System status & database connectivity |
| `/api/accounts` | `POST` | `ADMIN`, `MAKER` | Open a new bank account |
| `/api/accounts` | `GET` | `Authenticated` | List all bank accounts |
| `/api/accounts/{id}` | `GET` | `Authenticated` | View account details |
| `/api/accounts/{id}` | `PUT` | `ADMIN` | Update account configurations |
| `/api/accounts/{id}` | `DELETE` | `ADMIN` | Delete bank account |
| `/api/customers` | `POST` | `ADMIN`, `MAKER` | Register a new customer |
| `/api/customers` | `GET` | `Authenticated` | List registered customers |
| `/api/customers/{id}` | `GET` | `Authenticated` | View customer profile |
| `/api/customers/{id}` | `PUT` | `ADMIN`, `MAKER` | Update customer profile |
| `/api/customers/{id}` | `DELETE` | `ADMIN` | Remove customer profile |
| `/api/accounts/{id}/transactions` | `POST` | `ADMIN`, `MAKER` | Deposit or Withdraw funds |
| `/api/accounts/{id}/transactions` | `GET` | `Authenticated` | Fetch transaction audit ledger |
| `/api/beneficiaries` | `POST` | `Authenticated` | Add a transfer beneficiary |
| `/api/beneficiaries` | `GET` | `Authenticated` | List beneficiaries |
| `/api/beneficiaries/{id}` | `GET` | `Authenticated` | View beneficiary details |
| `/api/beneficiaries/{id}` | `PUT` | `ADMIN`, `MAKER` | Update beneficiary info |
| `/api/beneficiaries/{id}` | `DELETE` | `ADMIN`, `CHECKER` | Remove beneficiary |

### 3. Keycloak JWT Role Extraction (`JwtAuthConverter`)

Keycloak embeds roles inside the JWT in `realm_access.roles` (and optionally in `resource_access.<client>.roles`). Spring Security expects authorities prefixed with `ROLE_`. 

The custom [JwtAuthConverter.java](file:///c:/springboot/banking-system%20-%20Copy/src/main/java/com/gct/banking_system/config/JwtAuthConverter.java) automatically:
1. Extracts roles from `realm_access.roles`.
2. Extracts roles from `resource_access.*.roles`.
3. Emits both standard and uppercase role authorities (e.g. `ROLE_admin` and `ROLE_ADMIN`), ensuring case-insensitive role compatibility across annotations like `@PreAuthorize("hasRole('ADMIN')")` or `hasAnyRole('admin', 'maker')`.
4. Extracts `preferred_username` as the Spring Security `Principal` name.

---

## Keycloak Setup & Configuration Guide

### 1. Keycloak Server Details
- **Server URL**: `http://localhost:8081`
- **Realm Name**: `bank-app`
- **Client ID**: `bank-app`
- **Client Type**: OpenID Connect / Public Client

### 2. Client Access Settings (Admin Console)
Navigate to **Clients** $\to$ **bank-app** $\to$ **Settings**:
- **Client Authentication**: `Off` (Public client for Single-Page Applications)
- **Standard Flow**: `Enabled` (Authorization Code Flow)
- **Direct Access Grants**: `Enabled` (For CLI / Postman testing)
- **Root URL**: `http://localhost:3000`
- **Home URL**: `http://localhost:3000`
- **Valid redirect URIs**:
  ```
  http://localhost:3000/*
  http://localhost:3000/login
  ```
- **Valid post logout redirect URIs**:
  ```
  http://localhost:3000/*
  http://localhost:3000/login
  ```
- **Web origins**:
  ```
  http://localhost:3000
  +
  ```

### 3. Realm Roles Setup
Navigate to **Realm Roles** and create:
- `admin`
- `maker`
- `checker`


### 4. Creating Test Users & Assigning Roles
Navigate to **Users** $\to$ **Add User**:
1. **Admin User**:
   - Username: `admin-user`
   - Email: `admin@bank.com`
   - Set password under **Credentials** tab (turn off *Temporary*).
   - Assign Role under **Role mapping**: `admin`.
2. **Maker User**:
   - Username: `maker-user`
   - Role mapping: `maker`.
3. **Checker User**:
   - Username: `checker-user`
   - Role mapping: `checker`.

---

## Project Structure

```
banking-system
├── src/main/java/com/gct/banking_system
│   ├── BankingSystemApplication.java
│   ├── config
│   │   ├── CorsConfig.java            # Configures CORS origins for Next.js (port 3000)
│   │   ├── JwtAuthConverter.java      # Maps Keycloak realm & client roles to Spring authorities
│   │   └── SecurityConfig.java        # SecurityFilterChain, OAuth2 Resource Server, 401/403 handlers
│   ├── controller
│   │   ├── AccountController.java     # Protected by @PreAuthorize for Account CRUD
│   │   ├── BeneficiaryController.java # Protected by @PreAuthorize for Beneficiary management
│   │   ├── CustomerController.java    # Protected by @PreAuthorize for Customer CRUD
│   │   ├── SystemController.java      # Public health and metadata endpoints
│   │   └── TransactionController.java # Protected by @PreAuthorize for Deposit & Withdrawal
│   ├── dto                            # Request and Response transfer objects
│   ├── entity                         # JPA Entities (Customer, Account, Transaction, Beneficiary)
│   ├── exception                      # Centralized GlobalExceptionHandler & custom exceptions
│   ├── repository                     # Spring Data JPA Repositories
│   └── service                        # Business logic layer with @Transactional guarantees
│
├── banking-frontend                   # Next.js 15 + React 19 Frontend Web Portal
│   ├── src
│   │   ├── app                        # Next.js App Router (login, accounts, transactions, etc.)
│   │   ├── components                 # UI Components (Navbar, Sidebar, Modal, KPI Cards)
│   │   ├── context                    # AuthContext (Keycloak code exchange & token management)
│   │   ├── services                   # Axios API service with Bearer token interceptor
│   │   └── types                      # TypeScript interfaces and auth types
│   ├── package.json
│   └── next.config.mjs
│
├── docker-compose.yaml                # Multi-container orchestration (Postgres + Keycloak)
├── pom.xml                            # Maven build specification
└── README.md
```tomerController.java
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