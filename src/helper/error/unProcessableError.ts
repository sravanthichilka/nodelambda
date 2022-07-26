import statusCodes from "http-status-codes";

class UnProcessableError extends Error {
  statusCode = statusCodes.UNPROCESSABLE_ENTITY;
  constructor(message: string) {
    super(message);
    this.name = "UnProcessableError";
  }
}

export default UnProcessableError;
