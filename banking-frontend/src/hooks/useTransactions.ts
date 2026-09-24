import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/services/transactionService";
import { CreateTransactionDTO } from "@/types";
import { ACCOUNT_KEYS } from "./useAccounts";

export const TRANSACTION_KEYS = {
  byAccount: (accountId: number) => ["transactions", accountId] as const,
};

export function useAccountTransactions(accountId: number) {
  return useQuery({
    queryKey: TRANSACTION_KEYS.byAccount(accountId),
    queryFn: () => transactionService.getTransactionsByAccount(accountId),
    enabled: !!accountId && !isNaN(accountId),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      data,
    }: {
      accountId: number;
      data: CreateTransactionDTO;
    }) => transactionService.createTransaction(accountId, data),
    onSuccess: (_, variables) => {
      // Invalidate the transactions for this specific account
      queryClient.invalidateQueries({
        queryKey: TRANSACTION_KEYS.byAccount(variables.accountId),
      });
      // Invalidate accounts list and account detail to immediately reflect updated balance
      queryClient.invalidateQueries({ queryKey: ACCOUNT_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: ACCOUNT_KEYS.detail(variables.accountId),
      });
    },
  });
}
