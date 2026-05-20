import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { sendError } from "../utils/apiResponse";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return sendError(res, "Validation failed", 422, messages);
  }
  next();
};
