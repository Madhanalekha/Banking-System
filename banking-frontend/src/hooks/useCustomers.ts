import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customerService";
import { CreateCustomerDTO, UpdateCustomerDTO } from "@/types";

export const CUSTOMER_KEYS = {
  all: ["customers"] as const,
  detail: (id: number) => ["customers", id] as const,
};

export function useCustomers() {
  return useQuery({
    queryKey: CUSTOMER_KEYS.all,
    queryFn: customerService.getCustomers,
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.detail(id),
    queryFn: () => customerService.getCustomerById(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerDTO) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCustomerDTO }) =>
      customerService.updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all });
      // Invalidate accounts and beneficiaries since cascading or relationship queries might change
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
    },
  });
}
