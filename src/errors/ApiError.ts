export class ApiError extends Error {
  status_code: number;
  is_operational: boolean;

  constructor(status_code: number, message: string, is_operational = true) {
    super(message);
    this.status_code = status_code;
    this.is_operational = is_operational;

    Error.captureStackTrace(this, this.constructor);
  }
}
