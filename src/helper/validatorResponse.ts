import { NextFunction, Request, Response } from 'express';
import statusCodes from 'http-status-codes';
const Joi = require('@hapi/joi');

const validator = function (schema:any) {
  return (req: Request,res: Response,next: NextFunction) => {
    var errors: any = {};
    const rules = schema.validate(req);
    if (rules.error) {
        var error = rules.error.details;
        var firstError: string = error[0].context.key;
    
        for (var e of error) {
          let key: string = e.context.key;
          let label: string = e.context.label;
          errors[key] = e.message.replace(/['"]+/g, '').replace('body.','');
        }
        return res.status(422).send({
          status_code: 422,
          isJoi: true,
          message: errors[firstError],
          rules: errors,
        });
      } else {
        next();
      }
  }
}

export = validator;
