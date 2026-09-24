export type AccountType = 'SAVINGS' | 'CURRENT';

export interface Account {
  id: number;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  customerId: number;
  customerName: string;
}

export interface CreateAccountDTO {
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  customerId: number;
}

export interface UpdateAccountDTO {
  accountType: AccountType;
  balance: number;
}
