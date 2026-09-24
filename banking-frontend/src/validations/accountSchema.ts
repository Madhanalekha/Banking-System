import { z } from "zod";

export const createAccountSchema = z.object({
  accountNumber: z
    .string()
    .min(3, "Account number must be at least 3 characters")
    .max(20, "Account number cannot exceed 20 characters"),
  accountType: z.enum(["SAVINGS", "CURRENT"], {
    errorMap: () => ({ message: "Please select a valid account type" }),
  }),
  balance: z
    .coerce
    .number({ invalid_type_error: "Balance must be a valid number" })
    .min(0, "Balance cannot be negative"),
  customerId: z
    .coerce
    .number({ invalid_type_error: "Please select a valid customer" })
    .positive("Please select a customer"),
});

export const updateAccountSchema = z.object({
  accountType: z.enum(["SAVINGS", "CURRENT"], {
    errorMap: () => ({ message: "Please select a valid account type" }),
  }),
  balance: z
    .coerce
    .number({ invalid_type_error: "Balance must be a valid number" })
    .min(0, "Balance cannot be negative"),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;
export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;
