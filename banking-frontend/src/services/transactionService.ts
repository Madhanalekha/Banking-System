import api from "./api";
import { Transaction, CreateTransactionDTO } from "@/types";

export const transactionService = {
  getTransactionsByAccount: async (accountId: number): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>(`/api/accounts/${accountId}/transactions`);
    return response.data;
  },

  createTransaction: async (
    accountId: number,
    data: CreateTransactionDTO
  ): Promise<Transaction> => {
    const response = await api.post<Transaction>(
      `/api/accounts/${accountId}/transactions`,
      data
    );
    return response.data;
  },
};
