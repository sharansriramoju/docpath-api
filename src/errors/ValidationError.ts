import { ApiError } from "./ApiError";

export class ValidationError extends ApiError {
  details: any;

  constructor(message: string, details?: any) {
    super(400, message);
    this.details = details;
  }
}
