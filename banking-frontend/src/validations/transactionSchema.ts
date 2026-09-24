import { z } from "zod";

export const transactionSchema = z.object({
  accountId: z
    .coerce
    .number({ invalid_type_error: "Please select an account" })
    .positive("Please select an account"),
  amount: z
    .coerce
    .number({ invalid_type_error: "Amount must be a valid number" })
    .positive("Amount must be greater than 0")
    .min(0.01, "Minimum transaction amount is 0.01"),
  transactionType: z.enum(["DEPOSIT", "WITHDRAW"], {
    errorMap: () => ({ message: "Please select DEPOSIT or WITHDRAW" }),
  }),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
