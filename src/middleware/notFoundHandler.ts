import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => {

  response.status(404).send({ status_code:404, message: "Resource not found." });
};