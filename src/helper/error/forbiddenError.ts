import statusCodes from "http-status-codes";

class ForbiddenError extends Error {
  statusCode = statusCodes.FORBIDDEN;
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export default ForbiddenError;
