import { Response } from "express";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  errors?: string[];
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
  meta?: ApiResponse["meta"]
) => {
  const response: ApiResponse<T> = { success: true, message, data, meta };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: string[]
) => {
  const response: ApiResponse = { success: false, message, errors };
  return res.status(statusCode).json(response);
};
