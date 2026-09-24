import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountService } from "@/services/accountService";
import { CreateAccountDTO, UpdateAccountDTO } from "@/types";

export const ACCOUNT_KEYS = {
  all: ["accounts"] as const,
  detail: (id: number) => ["accounts", id] as const,
};

export function useAccounts() {
  return useQuery({
    queryKey: ACCOUNT_KEYS.all,
    queryFn: accountService.getAccounts,
  });
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: ACCOUNT_KEYS.detail(id),
    queryFn: () => accountService.getAccountById(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountDTO) => accountService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.all });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAccountDTO }) =>
      accountService.updateAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => accountService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.all });
    },
  });
}
