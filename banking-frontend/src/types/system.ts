export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  [key: string]: string | number | undefined;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
}

export interface DatabaseHealth {
  database: string;
  timestamp: string;
}

export interface SystemInfo {
  application: string;
  version: string;
  developer: string;
  java: string;
}
