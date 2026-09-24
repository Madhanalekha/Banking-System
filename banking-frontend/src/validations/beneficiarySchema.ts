import { z } from "zod";

export const beneficiarySchema = z.object({
  name: z.string().min(2, "Beneficiary name must be at least 2 characters"),
  accountNumber: z.string().min(3, "Account number must be at least 3 characters"),
  bankName: z.string().min(2, "Bank name must be at least 2 characters"),
  ifscCode: z
    .string()
    .min(4, "IFSC code is required")
    .toUpperCase(),
  customerId: z
    .coerce
    .number({ invalid_type_error: "Please select a customer" })
    .positive("Please select a customer"),
});

export const updateBeneficiarySchema = z.object({
  name: z.string().min(2, "Beneficiary name must be at least 2 characters"),
  accountNumber: z.string().min(3, "Account number must be at least 3 characters"),
  bankName: z.string().min(2, "Bank name must be at least 2 characters"),
  ifscCode: z
    .string()
    .min(4, "IFSC code is required")
    .toUpperCase(),
});

export type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;
export type UpdateBeneficiaryFormData = z.infer<typeof updateBeneficiarySchema>;
