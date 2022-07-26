import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import statusCodes from 'http-status-codes';
import config from '../config/app';
import log from '../helper/logs';
import userRepo from '../app/users/users.repo';
import { ENUM_User_Status } from '../helper/constants';
import MESSAGE_ENUM from '../helper/message';

/**
 * 
  1. Check JWT signature verification - valid or not 
  2. If JWT verified, then check roles can access the api.
  3. Then check users Status (active) can allow.
  4. If all conditions are meet. Pass user object for next middleware. 
 * 
 * @param allowRoles array [1,2,3]
 * @param allowStatus array [1]
 * @returns 
 */
const isAccessTokenValidMiddleware = function (allowRoles: number[], allowStatus: number[] = [ENUM_User_Status.ACTIVE]) {

  return async function (req: any, res: any, next: NextFunction) {

    try {
  
      const token: string = <string>req.header('authorization')
      if (!token) {
        return res.sendErrorResponse(statusCodes.UNPROCESSABLE_ENTITY, MESSAGE_ENUM.AUTHORIZATION_REQUIRED );      
      }

      const JWT_key = <string>config.jwt.SECRET_KEY;

      const verified: any = jwt.verify(token, JWT_key);
      if (verified) {

        const user: any = await userRepo.searchUser({ 'id': verified.id });

        if (user) {

          if (!(allowRoles.includes(user.role))) {
            return res.sendErrorResponse(statusCodes.FORBIDDEN, MESSAGE_ENUM.FORBIDDEN );
            // return res.status(statusCodes.FORBIDDEN).send({ status_code: statusCodes.FORBIDDEN, message: MESSAGE_ENUM.FORBIDDEN });
          }

          if (!(allowStatus.includes(user.status))) {
            return res.sendErrorResponse(451, MESSAGE_ENUM.ACCOUNT_PENDING_DEACTIVE,{ redirectToLogin:true} );
          }

          req.user = user;
          next();
        } else {
          return res.sendErrorResponse(statusCodes.UNAUTHORIZED, MESSAGE_ENUM.INVALID_ACCESS_TOKEN );
        }

      } else {        
        return res.sendErrorResponse(440, MESSAGE_ENUM.ACCESS_TOKEN_EXPIRED );
      }
    } catch (JsonWebTokenError: any) {

      log.error(['Middleware Jwt error..', JsonWebTokenError.name, JsonWebTokenError.message]);

      if (JsonWebTokenError.name == "TokenExpiredError") {
        return res.sendErrorResponse(440, MESSAGE_ENUM.ACCESS_TOKEN_EXPIRED );
      }
      if (JsonWebTokenError.name == "JsonWebTokenError") {
        return res.sendErrorResponse(440, MESSAGE_ENUM.ACCESS_TOKEN_EXPIRED );
      }
    }

  }
}


export default isAccessTokenValidMiddleware;