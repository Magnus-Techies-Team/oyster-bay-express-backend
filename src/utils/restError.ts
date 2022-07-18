import { CustomError } from "~/types/restErrorTypes";

export class RestError extends Error {
  public statusCode: number;
  public error: string;
  public message: string;

  constructor(error: CustomError, message: string) {
    super();
    (this.statusCode = error.statusCode),
      (this.error = error.errorMessage),
      (this.message = message);
  }

  get json(): { [key: string]: any } {
    return {
      statusCode: this.statusCode,
      error: this.error,
      message: this.message,
    };
  }

  get string(): string {
    return JSON.stringify({
      statusCode: this.statusCode,
      error: this.error,
      message: this.message,
    });
  }
}
