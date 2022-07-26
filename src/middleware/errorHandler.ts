import { Request, Response, NextFunction } from "express";
import log from '../helper/logs'

export const errorHandler = (
  error: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {

  if (error && error.error && error.error.isJoi) {
    return  response.status(422).json({
        status_code: 422,
        isJoi: true,
      type: error.type, 
      message: error.error.toString(),
      error
    });
  }else{
    const status = error.statusCode || error.status || 500;
    log.error(error)
    return response.status(500).send({
      status_code: 500,
    message: error.message,
    error
  });
  } 

  
 
};