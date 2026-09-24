export type TransactionType = 'DEPOSIT' | 'WITHDRAW';

export interface Transaction {
  id: number;
  amount: number;
  transactionType: TransactionType;
  transactionDate: string;
  accountId: number;
  accountNumber: string;
}

export interface CreateTransactionDTO {
  amount: number;
  transactionType: TransactionType;
}
