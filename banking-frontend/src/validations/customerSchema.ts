import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must contain exactly 10 digits"),
  address: z.string().min(3, "Address must be at least 3 characters long"),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
