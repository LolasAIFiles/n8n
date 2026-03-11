export class AppError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, message: string, code = 'APP_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
