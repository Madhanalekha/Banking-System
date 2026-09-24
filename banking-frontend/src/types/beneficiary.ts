export interface Beneficiary {
  id: number;
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  customerId: number;
  customerName: string;
}

export interface CreateBeneficiaryDTO {
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  customerId: number;
}

export interface UpdateBeneficiaryDTO {
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}
