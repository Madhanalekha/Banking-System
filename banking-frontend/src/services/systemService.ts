import api from "./api";
import { SystemHealth, DatabaseHealth, SystemInfo } from "@/types";

export const systemService = {
  getHealth: async (): Promise<SystemHealth> => {
    const response = await api.get<SystemHealth>("/health");
    return response.data;
  },

  getDatabaseHealth: async (): Promise<DatabaseHealth> => {
    const response = await api.get<DatabaseHealth>("/health/db");
    return response.data;
  },

  getInfo: async (): Promise<SystemInfo> => {
    const response = await api.get<SystemInfo>("/info");
    return response.data;
  },
};
