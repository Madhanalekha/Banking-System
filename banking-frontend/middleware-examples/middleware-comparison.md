# Middleware Concepts: Express Middleware vs Next.js Middleware

This document provides a conceptual comparison between **Express Middleware** and **Next.js Middleware** for modern full-stack web applications.

---

## 1. What is Middleware?

Middleware is software that acts as a bridge between an incoming request and the final route handler/response. It forms a pipeline where each function in the chain can:
1. Execute code.
2. Modify the request (`req`) and response (`res`) objects.
3. Terminate the request-response cycle early (e.g. on validation failure).
4. Call `next()` to pass control to the next middleware in the stack.

```text
Incoming Request ──► [ Middleware 1 ] ──► [ Middleware 2 ] ──► [ Route Handler ] ──► Response
```

---

## 2. Express Middleware Architecture

In traditional Node.js/Express applications, middleware executes sequentially in the order registered via `app.use()` or within specific route definitions.

### Key Types of Express Middleware:
1. **Application-level Middleware**:
   ```javascript
   // Executes for every route
   app.use((req, res, next) => {
     console.log(`${req.method} ${req.url}`);
     next();
   });
   ```

2. **Router / Validation Middleware**:
   ```javascript
   // Executes only on specific matching routes
   const validatePayload = (req, res, next) => {
     if (!req.body.amount || req.body.amount <= 0) {
       return res.status(400).json({ error: "Invalid amount" });
     }
     next();
   };
   app.post('/api/transactions', validatePayload, handleTransaction);
   ```

3. **Error-Handling Middleware**:
   ```javascript
   // Defined with 4 arguments: (err, req, res, next)
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({ message: "Something went wrong" });
   });
   ```

---

## 3. Next.js Middleware Architecture

In **Next.js (App Router)**, middleware is defined in a single file (`middleware.ts` at the root of `src/`). It runs on the **Edge Runtime** (lightweight V8 environment) before any page, route handler, or static asset is rendered.

```typescript
// middleware.ts (Next.js Example)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Inspect request headers, cookies, or path
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-start', Date.now().toString());

  // 2. Perform URL rewriting or redirecting
  if (request.nextUrl.pathname === '/legacy-accounts') {
    return NextResponse.redirect(new URL('/accounts', request.url));
  }

  // 3. Continue the request chain with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Config matcher determines which routes run through the middleware
export const config = {
  matcher: ['/customers/:path*', '/accounts/:path*', '/transactions/:path*'],
};
```

---

## 4. Architectural Comparison Table

| Feature | Express.js Middleware | Next.js Middleware (`middleware.ts`) |
| :--- | :--- | :--- |
| **Runtime Environment** | Node.js Runtime (Full Node APIs, `fs`, `net`, `http`) | Edge Runtime (Lightweight V8, limited Node APIs for high speed) |
| **Primary Use Cases** | Request parsing (`express.json`), validation, database hooks, controllers | Edge redirects, URL rewrites, custom request/response headers, geolocation |
| **Execution Chain** | Array-based pipeline where multiple middlewares chain via `next()` | Single entry point function returning `NextResponse.next()` or `NextResponse.redirect()` |
| **Error Handling** | Special 4-arity function: `(err, req, res, next)` | Handled via React Error Boundaries (`error.tsx`) & global catch blocks |
| **Placement** | Inside Node/Express server files (`app.use(...)`) | `src/middleware.ts` at the root of the project |

---

## 5. Summary for Banking Application Architecture

In this training architecture:
- **Spring Boot** serves as the primary backend REST API and persistence layer.
- **Next.js** acts as the frontend client consuming Spring Boot via **Axios** and **React Query**.
- **Express Middleware concepts** help developers understand the request/response lifecycle, interceptors, and error handling patterns that apply universally across modern web architectures.
