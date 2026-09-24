import api from "./api";
import { Beneficiary, CreateBeneficiaryDTO, UpdateBeneficiaryDTO } from "@/types";

export const beneficiaryService = {
  getBeneficiaries: async (): Promise<Beneficiary[]> => {
    const response = await api.get<Beneficiary[]>("/api/beneficiaries");
    return response.data;
  },

  getBeneficiaryById: async (id: number): Promise<Beneficiary> => {
    const response = await api.get<Beneficiary>(`/api/beneficiaries/${id}`);
    return response.data;
  },

  createBeneficiary: async (data: CreateBeneficiaryDTO): Promise<Beneficiary> => {
    const response = await api.post<Beneficiary>("/api/beneficiaries", data);
    return response.data;
  },

  updateBeneficiary: async (
    id: number,
    data: UpdateBeneficiaryDTO
  ): Promise<Beneficiary> => {
    const response = await api.put<Beneficiary>(`/api/beneficiaries/${id}`, data);
    return response.data;
  },

  deleteBeneficiary: async (id: number): Promise<string> => {
    const response = await api.delete<string>(`/api/beneficiaries/${id}`);
    return response.data;
  },
};
