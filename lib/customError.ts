export class CustomError extends Error {
  statusCode?: number;
  message: string;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;

    Object.setPrototypeOf(this, new.target.prototype); // maintain prototype chain
  }
}
