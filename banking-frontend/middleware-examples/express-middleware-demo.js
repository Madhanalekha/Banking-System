/**
 * Express Middleware Learning Module
 * Banfico Training Program — Banking Application
 * 
 * This file demonstrates standard Express middleware concepts:
 * 1. Request Logging Middleware
 * 2. Request Timing & Performance Header Middleware
 * 3. Basic Request Validation Middleware
 * 4. Centralized Error-Handling Middleware
 * 
 * Middleware Chain Architecture:
 * ┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
 * │  Client  │ ──► │ Logger       │ ──► │ Timer        │ ──► │ Route Handler│ ──► │ Error Handler│
 * │  Request │     │ (req,res,next│     │ (req,res,next│     │ (req,res)    │     │(err,req,res,n│
 * └──────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
 */

const express = require('express');
const app = express();
const PORT = 3001;

// Built-in middleware to parse incoming JSON bodies
app.use(express.json());

// ============================================================================
// 1. REQUEST LOGGING MIDDLEWARE
// ============================================================================
// Logs every incoming request method, path, and timestamp
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Incoming Request: ${req.method} ${req.originalUrl}`);
  
  // Call next() to pass control to the next middleware in the pipeline
  next();
});

// ============================================================================
// 2. REQUEST TIMING MIDDLEWARE
// ============================================================================
// Measures execution latency and injects a custom response header
app.use((req, res, next) => {
  const startTime = process.hrtime();

  // Intercept the response finish event to calculate elapsed time
  res.on('finish', () => {
    const elapsed = process.hrtime(startTime);
    const elapsedMs = (elapsed[0] * 1000 + elapsed[1] / 1e6).toFixed(2);
    console.log(`[Timing] ${req.method} ${req.originalUrl} completed in ${elapsedMs}ms with status ${res.statusCode}`);
  });

  next();
});

// ============================================================================
// 3. CUSTOM REQUEST VALIDATION MIDDLEWARE
// ============================================================================
// Example: Middleware to validate deposit/withdrawal payload before reaching the handler
const validateTransactionPayload = (req, res, next) => {
  const { amount, transactionType } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    // Return a 400 Bad Request if validation fails
    return res.status(400).json({
      status: 400,
      error: "Bad Request",
      message: "Transaction amount must be a positive number greater than 0."
    });
  }

  if (!transactionType || !['DEPOSIT', 'WITHDRAW'].includes(transactionType)) {
    return res.status(400).json({
      status: 400,
      error: "Bad Request",
      message: "transactionType must be either 'DEPOSIT' or 'WITHDRAW'."
    });
  }

  // Payload is valid, proceed to the route handler
  next();
};

// ============================================================================
// ROUTES DEMONSTRATING MIDDLEWARE
// ============================================================================

// Sample health check route
app.get('/health', (req, res) => {
  res.json({
    status: "UP",
    service: "Express Middleware Demo Server",
    timestamp: new Date().toISOString()
  });
});

// Sample route protected by the transaction validation middleware
app.post('/api/accounts/:accountId/transactions', validateTransactionPayload, (req, res) => {
  const { accountId } = req.params;
  const { amount, transactionType } = req.body;

  res.status(201).json({
    id: Math.floor(Math.random() * 1000),
    accountId: Number(accountId),
    amount,
    transactionType,
    transactionDate: new Date().toISOString(),
    status: "PROCESSED"
  });
});

// Route designed to trigger an uncaught error to demonstrate error middleware
app.get('/trigger-error', (req, res, next) => {
  const simulatedError = new Error("Simulated database connection failure.");
  simulatedError.status = 500;
  // Pass the error to next() to jump directly to the Error-Handling Middleware
  next(simulatedError);
});

// ============================================================================
// 4. CENTRALIZED ERROR-HANDLING MIDDLEWARE
// ============================================================================
// Express recognizes this as an error handler because it takes exactly 4 parameters: (err, req, res, next)
app.use((err, req, res, next) => {
  console.error('[Error Middleware Caught Error]:', err.message);

  const statusCode = err.status || 500;
  const userFriendlyMessage = statusCode === 500
    ? "An unexpected internal server error occurred. Please try again later."
    : err.message;

  res.status(statusCode).json({
    timestamp: new Date().toISOString(),
    status: statusCode,
    error: statusCode === 400 ? "Bad Request" : "Internal Server Error",
    message: userFriendlyMessage,
    path: req.originalUrl
  });
});

// Start server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Express Middleware Demo Server running on http://localhost:${PORT}`);
    console.log(`Try GET http://localhost:${PORT}/health`);
    console.log(`Try POST http://localhost:${PORT}/api/accounts/1/transactions with JSON { "amount": 500, "transactionType": "DEPOSIT" }`);
  });
}

module.exports = app;
