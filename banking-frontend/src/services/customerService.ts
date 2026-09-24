import api from "./api";
import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from "@/types";

export const customerService = {
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get<Customer[]>("/api/customers");
    return response.data;
  },

  getCustomerById: async (id: number): Promise<Customer> => {
    const response = await api.get<Customer>(`/api/customers/${id}`);
    return response.data;
  },

  createCustomer: async (data: CreateCustomerDTO): Promise<Customer> => {
    const response = await api.post<Customer>("/api/customers", data);
    return response.data;
  },

  updateCustomer: async (id: number, data: UpdateCustomerDTO): Promise<Customer> => {
    const response = await api.put<Customer>(`/api/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: number): Promise<string> => {
    const response = await api.delete<string>(`/api/customers/${id}`);
    return response.data;
  },
};
