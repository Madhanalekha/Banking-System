# Banking System — Frontend Application

A modern, responsive, and robust **Banking & Open Banking frontend interface** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **TanStack React Query**, **Axios**, **React Hook Form**, and **Zod**.

This frontend communicates directly with the **Spring Boot Core Banking REST API** (`http://localhost:8080`) to manage Customers, Accounts, Transactions (Deposit/Withdraw ledger), and Beneficiaries.

---

## Table of Contents
1. [Project Overview & Key Features](#project-overview--key-features)
2. [Technology Stack](#technology-stack)
3. [Project Directory Structure](#project-directory-structure)
4. [Environment Configuration](#environment-configuration)
5. [Installation & Setup](#installation--setup)
6. [Data Flow & Architecture](#data-flow--architecture)
7. [Spring Boot Backend Integration](#spring-boot-backend-integration)
8. [Axios Centralized Client & Interceptors](#axios-centralized-client--interceptors)
9. [TanStack React Query Architecture](#tanstack-react-query-architecture)
10. [Forms & Client-Side Validation (Zod)](#forms--client-side-validation-zod)
11. [Centralized Error Handling](#centralized-error-handling)
12. [Authentication & Security](#authentication--security)
13. [End-to-End Testing Guide](#end-to-end-testing-guide)

---

## Project Overview & Key Features

- **Dashboard**: Real-time overview of total customers, total accounts, total ledger funds, beneficiary count, and live health status of the Spring Boot API and PostgreSQL database.
- **Authentication & Security**:
  - Secure login/logout via Keycloak OAuth2 / OpenID Connect.
  - Role-Based Access Control (RBAC) supporting Admin, Maker and Checker roles.
  - Persistent auth state managed via React Context and `localStorage`.
  - Protected routes utilizing Next.js Edge Middleware.
- **User Profile**: Top navigation and sidebar profile components displaying user initials, roles, and quick logout actions.
- **Customer Management**:
  - Full CRUD operations (List, Create, View/Edit, Delete).
  - Search by Name, Email, or Phone.
  - Linked accounts & beneficiaries summary per customer.
  - Delete confirmation dialog.
- **Account Management**:
  - List accounts with owner details and balances.
  - Filter by Account Type (`SAVINGS` / `CURRENT`).
  - Open new account linked to a customer with initial deposit.
  - Direct ledger access.
- **Transaction Processing (Ledger)**:
  - Deposit and Withdrawal execution.
  - Dynamic balance preview before submission.
  - Overdraft detection warning banner.
  - Automatic cache invalidation: instantly updates both the transaction history and account balance across the UI.
- **Beneficiary Management**:
  - Register third-party payees with Bank Name and IFSC code.
  - Prevention and friendly messaging for duplicate beneficiary entries.
- **Resilient UI**:
  - Reusable Skeleton loaders (`<Loading />`).
  - Contextual Empty states with CTA buttons (`<EmptyState />`).
  - Confirmation modals for destructive actions (`<ConfirmDialog />`).
  - Inline error rendering below form fields.

---

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict type checking)
- **Authentication**: Keycloak (OAuth2 / OIDC) with Next.js Middleware for protected routes
- **State Management & Caching**: TanStack React Query v5
- **HTTP Client**: Axios (with custom request/response/error/auth interceptors)
- **Form Handling**: React Hook Form
- **Schema Validation**: Zod (with `@hookform/resolvers`)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

---

## Project Directory Structure

```text
banking-frontend/
│
├── src/
│   ├── app/                          # Next.js App Router Pages
│   │   ├── layout.tsx                # Root layout (QueryProvider, Navbar, Sidebar)
│   │   ├── page.tsx                  # Banking Dashboard
│   │   ├── globals.css               # Tailwind CSS rules & animations
│   │   ├── customers/
│   │   │   ├── page.tsx              # Customer list & search
│   │   │   ├── new/page.tsx          # Create customer form
│   │   │   └── [id]/page.tsx         # Customer details & edit form
│   │   ├── accounts/
│   │   │   ├── page.tsx              # Account list & filter
│   │   │   ├── new/page.tsx          # Open account form
│   │   │   └── [id]/page.tsx         # Account details & transaction ledger
│   │   ├── transactions/
│   │   │   ├── page.tsx              # Transaction ledger overview
│   │   │   └── new/page.tsx          # Deposit / Withdraw transaction form
│   │   └── beneficiaries/
│   │       ├── page.tsx              # Beneficiary list & search
│   │       ├── new/page.tsx          # Add beneficiary form
│   │       └── [id]/page.tsx         # Beneficiary details & update form
│   │
│   ├── components/                   # Reusable UI Components
│   │   ├── Navbar.tsx                # Top navigation with live API health status
│   │   ├── Sidebar.tsx               # Responsive sidebar navigation
│   │   ├── Loading.tsx               # Skeleton & spinner loading states
│   │   ├── ErrorMessage.tsx          # Alert banner for user-friendly errors
│   │   ├── EmptyState.tsx            # Placeholder UI for empty collections
│   │   ├── ConfirmDialog.tsx         # Modal dialog for confirmation
│   │   ├── FormField.tsx             # Form input wrapper with label & error
│   │   └── StatusBadge.tsx           # Badges for account/transaction types
│   │
│   ├── services/                     # Centralized API Services
│   │   ├── api.ts                    # Centralized Axios instance & interceptors
│   │   ├── customerService.ts        # Customer HTTP calls
│   │   ├── accountService.ts         # Account HTTP calls
│   │   ├── transactionService.ts     # Transaction HTTP calls
│   │   ├── beneficiaryService.ts     # Beneficiary HTTP calls
│   │   └── systemService.ts          # Health check & system metadata
│   │
│   ├── hooks/                        # Custom React Query Hooks
│   │   ├── useCustomers.ts           # Customer queries & mutations
│   │   ├── useAccounts.ts            # Account queries & mutations
│   │   ├── useTransactions.ts        # Transaction queries & mutations
│   │   └── useBeneficiaries.ts       # Beneficiary queries & mutations
│   │
│   ├── providers/                    # React Query Provider
│   │   └── QueryProvider.tsx
│   │
│   ├── types/                        # TypeScript Interfaces matching backend DTOs
│   │   ├── customer.ts
│   │   ├── account.ts
│   │   ├── transaction.ts
│   │   ├── beneficiary.ts
│   │   ├── system.ts
│   │   └── index.ts
│   │
│   └── validations/                  # Zod Schemas
│       ├── customerSchema.ts
│       ├── accountSchema.ts
│       ├── transactionSchema.ts
│       └── beneficiarySchema.ts
│
├── .env.local                        # Configured environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## Environment Configuration

Create a `.env.local` file in the root of `banking-frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> **Note**: The application uses `process.env.NEXT_PUBLIC_API_URL` centrally inside `src/services/api.ts`. No URLs are hardcoded inside individual components.

---

## Installation & Setup

### 1. Install Node Dependencies
From the `banking-frontend` directory:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

---

## Data Flow & Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router UI                    │
│   (Dashboard, Customers, Accounts, Transactions, Benef.)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ User Interaction / Form submit
┌──────────────────────────────▼──────────────────────────────┐
│                  Zod Form Validation Layer                  │
│       (react-hook-form + @hookform/resolvers/zod)           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Validated DTO
┌──────────────────────────────▼──────────────────────────────┐
│                  React Query Custom Hooks                   │
│   (useCustomers, useAccounts, useTransactions, useBenef.)   │
│   * Manages server state, caching, loading, invalidation    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Async API invocation
┌──────────────────────────────▼──────────────────────────────┐
│                    Service Layer (Axios)                    │
│    (customerService, accountService, transactionService)    │
│    * Transforms requests & intercepts errors gracefully     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP JSON (via :8080)
┌──────────────────────────────▼──────────────────────────────┐
│                 Spring Boot Backend REST API                │
└──────────────────────────────┬──────────────────────────────┘
                               │ JPA / Hibernate
┌──────────────────────────────▼──────────────────────────────┐
│                     PostgreSQL Database                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Spring Boot Backend Integration

The frontend routes align directly with the Spring Boot REST controllers:

| Feature | HTTP Method | Endpoint | Backend Service |
| :--- | :--- | :--- | :--- |
| **System** | `GET` | `/health` | `SystemController` |
| **System DB** | `GET` | `/health/db` | `DatabaseStatusService` |
| **Customers** | `GET`, `POST` | `/api/customers` | `CustomerService` |
| | `GET`, `PUT`, `DELETE` | `/api/customers/{id}` | `CustomerService` |
| **Accounts** | `GET`, `POST` | `/api/accounts` | `AccountService` |
| | `GET`, `PUT`, `DELETE` | `/api/accounts/{id}` | `AccountService` |
| **Transactions**| `POST` | `/api/accounts/{accountId}/transactions` | `TransactionService` (Deposit/Withdraw) |
| | `GET` | `/api/accounts/{accountId}/transactions` | `TransactionService` (Ledger history) |
| **Beneficiaries**| `GET`, `POST` | `/api/beneficiaries` | `BeneficiaryService` |
| | `GET`, `PUT`, `DELETE` | `/api/beneficiaries/{id}` | `BeneficiaryService` |

---

## Axios Centralized Client & Interceptors

All requests flow through `src/services/api.ts`. The response interceptor maps technical HTTP error statuses into user-friendly messages:

- **400 Bad Request**: Formats validation error maps or displays business rule errors (e.g. *"Insufficient balance for withdrawal"*).
- **404 Not Found**: *"The requested record was not found."*
- **409 Conflict**: *"This record already exists (duplicate entry conflict)."*
- **500 Internal Server Error**: *"Something went wrong on the server. Please try again later."*
- **Network Errors / Timeout**: *"Unable to connect to the banking server. Please ensure the Spring Boot API is running on port 8080."*

---

## TanStack React Query Architecture

React Query maintains the local client cache for server data. Key benefits utilized:
1. **Automatic Query Invalidation**: When a transaction is submitted, `queryClient.invalidateQueries` refreshes both the transaction list and the target account's balance so the UI reflects real-time balance consistency.
2. **Declarative State**: Components read `{ data, isLoading, error, refetch }` without managing manual `useEffect` / `useState` boilerplate.
3. **Stale Time Optimization**: Standard queries are cached for 30 seconds to prevent unnecessary network overhead.

---

## Forms & Client-Side Validation (Zod)

Forms utilize React Hook Form connected with Zod schemas:
- **Customer Form**: Name (min 2 chars), Email (valid email pattern), Phone (10 digits), Address.
- **Account Form**: Customer selection, Account Number, Account Type (`SAVINGS` / `CURRENT`), Initial balance $\ge 0$.
- **Transaction Form**: Account selection, Transaction Type (`DEPOSIT` / `WITHDRAW`), Amount $> 0$.
- **Beneficiary Form**: Customer selection, Payee Name, Account Number, Bank Name, IFSC code.

---

## Authentication & Security

The frontend implements a robust OAuth2 authorization code flow using **Keycloak**:

1. **Authentication State**: Managed globally via `AuthContext.tsx`. The access token (JWT) is stored securely in `localStorage` and automatically attached to outbound API requests via Axios interceptors.
2. **Role-Based Access Control (RBAC)**: The application reads the `realm_access.roles` claim from the decoded JWT to determine user privileges (`admin`, `maker`, `checker`).
3. **Route Protection**: Next.js `middleware.ts` intercepts requests. If a user is unauthenticated, they are redirected to the Keycloak login page or a designated login prompt.
4. **User Profile & Logout**: Both the `Navbar` and `Sidebar` feature dynamic user profile displays that show the authenticated user's name, initials, and assigned roles, along with one-click **Logout** functionality to clear sessions and return to the login view.

---

## End-to-End Testing Guide

Ensure your Spring Boot backend is running on `http://localhost:8080` before testing:

1. **Dashboard Check**: Navigate to `/` $\to$ Verify API and PostgreSQL status badges display `UP`.
2. **Customer Flow**:
   - Go to `/customers/new` $\to$ Create customer `"Madhan"`, `"madhan@example.com"`, `"9876543210"`.
   - Verify customer appears on `/customers`.
   - Click customer $\to$ View details and update residential address.
3. **Account Flow**:
   - Go to `/accounts/new` $\to$ Select customer `"Madhan"`, Account `"ACC100001"`, `SAVINGS`, Initial Balance `5000`.
   - Verify account is listed on `/accounts` with balance `₹5,000.00`.
4. **Transaction Ledger Flow**:
   - Go to `/transactions/new` $\to$ Select `"ACC100001"`, choose `DEPOSIT`, Amount `2500` $\to$ Submit.
   - Verify redirected to account ledger $\to$ Balance increased to `₹7,500.00`.
   - Submit `WITHDRAW` for `1500` $\to$ Balance decreased to `₹6,000.00`.
   - Test Overdraft: Attempt `WITHDRAW` for `100000` $\to$ Verify error banner displays *"Insufficient balance for withdrawal"*.
5. **Beneficiary Flow**:
   - Go to `/beneficiaries/new` $\to$ Link to `"Madhan"`, Name `"Rahul Sharma"`, Account `"ACC200001"`, Bank `"SBI"`, IFSC `"SBIN0001234"`.
   - Verify listed on `/beneficiaries`.
   - Test Duplicate: Attempt to add another beneficiary with the same account number for the same customer $\to$ Verify `409 Conflict` error is handled cleanly.
