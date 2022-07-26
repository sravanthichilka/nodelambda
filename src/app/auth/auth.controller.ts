import HelperController from "./auth.helper";
import statusCodes from "http-status-codes";
import config from "../../config/app";
import jwt from "jsonwebtoken";
import authRepo from "./auth.repo";
import userRepo from "../users/users.repo";
import log from "../../helper/logs";
import { sendEmail } from "../../helper/mail_ses";
import emailtemplates from "../../templates/emailTemplates";
import { ENUM_EVENT_TYPE_LOGS, ENUM_User_ROLE, ENUM_User_Status } from "../../helper/constants";
import customersRepo from "../customers/customers.repo";
import MESSAGE_ENUM from "../../helper/message";
import { getCompanyUserDataFromUserIdModel } from "../customers/customer.interface";
import EventLogCustomEmitter from ".././../customEvents/customEventType";
import { findUserForLoginDataInterface } from "../users/user.interface";
import { addLogEventInterface } from "../../customEvents/customEventInterface";
import CUSTOMER_EVENT_MESSAGE from "../../customEvents/customEventMessage";

class AuthController extends HelperController {
  async login(req: any, res: any) {
    try {
      const {
        body: { email, password },
        userAgent,
      } = req;
      const user: findUserForLoginDataInterface = <findUserForLoginDataInterface>(
        await userRepo.findUserForLoginData(email)
      );

      if (user) {
        const user_id: number = user.id;

        super.validateUserStatusDeactive(user.status);

        const checkAuth = await super.hashCheck(user, email, password);
        delete user.salt;
        delete user.hash;

        if (checkAuth) {
          const getCompanyUserDetailPromise: Promise<getCompanyUserDataFromUserIdModel> =
            customersRepo.getCompanyUserDataFromUserId(user_id);
          const generateTokenPromise = super.generateAuthToken(user_id, "access");
          const generateRefreshTokenPromise = super.generateAuthToken(user_id, "refresh");

          Promise.all([generateTokenPromise, generateRefreshTokenPromise])
            .then(async (values: [string, string]) => {
              let [accessToken, refreshToken] = values;
              await authRepo.insertAuthTokens(
                user_id,
                userAgent,
                refreshToken,
                <number>config.jwt.REFRESH_EXPIRES_IN
              );

              if (user.role === ENUM_User_ROLE.CUSTOMER_USER) {
                const companyUserDetail: any = await getCompanyUserDetailPromise;
                user.companyId = companyUserDetail.companyId;
                user.isCompanyOwner = companyUserDetail.isCompanyOwner;
              }

              let user_update = await userRepo.updateLastLoggedIn(user_id);
              const data = { user, accessToken, refreshToken };

              const fullName = user.fullName;
              const eventLogInt = ENUM_EVENT_TYPE_LOGS.LOGIN.id;
              const eventTypeLabel = ENUM_EVENT_TYPE_LOGS.LOGIN.eventTypeName;
              // event log
              const addEventData: addLogEventInterface = {
                alterRecordUserId: user_id,
                userId: user_id,
                userRoleId: user.role,
                alterRecordUserRoleId: user.role,
                userName: fullName,
                eventTypeId: eventLogInt,
                eventTypeLabel,
                userAgent,
                eventMessage: CUSTOMER_EVENT_MESSAGE.LOGGED_IN_MESSAGE.replace(
                  "%loginUserName%",
                  fullName
                ),
              };
              EventLogCustomEmitter.emit("add-event", addEventData);

              return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.LOGIN_SUCCESSFULLY, data);
            })
            .catch((e) => {
              return res.sendErrorResponse(
                statusCodes.INTERNAL_SERVER_ERROR,
                e.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
                { errors: e.message }
              );
            });
        } else {
          // Invalide crediantials..
          return res.sendErrorResponse(statusCodes.UNAUTHORIZED, MESSAGE_ENUM.INVALID_CREDENTAILS);
        }
      } else {
        return res.sendErrorResponse(statusCodes.UNAUTHORIZED, MESSAGE_ENUM.EMAIL_NOT_ASSOCIATE);
      }
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async forgotPassword(req: any, res: any) {
    try {
      const {
        body: { email },
        userAgent,
      } = req;

      const user: any = await userRepo.findEmail(email);

      if (user) {
        const fullName = user.fullName;
        super.validateUserStatusDeactive(user.status);

        const user_email = email;
        const user_id = user.id;
        delete user.id;

        const token = await super.generateAuthToken(user_id, "reset_password");
        user.resetPassword = 1;
        user.verificationCode = token;
        let user_update = await userRepo.updateUser(user_id, user);

        if (user_update) {
          let reset_link =
            config.web.LINK + "/" + config.web.RESET_PASSWORD_LINK + "?token=" + token;

          sendEmail(
            [user_email],
            emailtemplates.forgotpassword.subject,
            emailtemplates.forgotpassword.returnHtml({
              firstName: user.firstName,
              resetLink: reset_link,
            })
          );

          // event log
          const eventLogInt = ENUM_EVENT_TYPE_LOGS.FORGOT_PASSWORD.id;
          const eventTypeLabel = ENUM_EVENT_TYPE_LOGS.FORGOT_PASSWORD.eventTypeName;

          const addEventData: addLogEventInterface = {
            alterRecordUserId: user_id,
            userId: user_id,
            userRoleId: user.role,
            alterRecordUserRoleId: user.role,
            userName: fullName,
            eventTypeId: eventLogInt,
            eventTypeLabel,
            userAgent,
            eventMessage: CUSTOMER_EVENT_MESSAGE.FORGOT_PASSWORD.replace(
              "%loginUserName%",
              fullName
            ),
          };
          EventLogCustomEmitter.emit("add-event", addEventData);

          return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.RESET_LINK_SEND);
        } else {
          return res.sendErrorResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            MESSAGE_ENUM.SOMETHING_WENT_WRONG
          );
        }
      } else {
        return res.sendErrorResponse(statusCodes.NOT_FOUND, MESSAGE_ENUM.EMAIL_NOT_FOUND);
      }
    } catch (Error: any) {
      log.error(["forgotPassword", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async resetPassword(req: any, res: any) {
    try {
      const {
        body: { password, token: reset_token },
        userAgent,
      } = req;
      const JWT_Refresh_key = <string>config.jwt.SECRET_KEY;
      let verified: any;

      try {
        verified = jwt.verify(reset_token, JWT_Refresh_key);
      } catch (e) {
        return res.sendErrorResponse(
          statusCodes.UNPROCESSABLE_ENTITY,
          MESSAGE_ENUM.REQUEST_FORGOT_PASSWORD_AGAIN
        );
      }
      const condition = { verificationCode: reset_token, id: verified.id };
      const user: any = await userRepo.searchUser(condition);
      if (user) {
        const fullName = user.fullName;

        super.validateUserStatusDeactive(user.status);

        const user_id = user.id;
        const salt = user.salt;
        delete user.id;
        const user_name = user.email;
        const hash = await super.createHash(salt, user_name, password);
        user.hash = hash;
        user.resetPassword = 0;
        user.verificationCode = null;
        user.setTemporaryPassword = 0;

        let user_update = await userRepo.updateUser(user_id, user);

        if (user_update) {
          // event log
          const eventLogInt = ENUM_EVENT_TYPE_LOGS.RESET_PASSWORD.id;
          const eventTypeLabel = ENUM_EVENT_TYPE_LOGS.RESET_PASSWORD.eventTypeName;

          const addEventData: addLogEventInterface = {
            alterRecordUserId: user_id,
            userId: user_id,
            userRoleId: user.role,
            alterRecordUserRoleId: user.role,
            userName: fullName,
            eventTypeId: eventLogInt,
            eventTypeLabel,
            userAgent,
            eventMessage: CUSTOMER_EVENT_MESSAGE.RESET_PASSWORD.replace(
              "%loginUserName%",
              fullName
            ),
          };
          EventLogCustomEmitter.emit("add-event", addEventData);

          return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.PASSWORD_RESET_SUCCESSFULLY);
        } else {
          return res.sendErrorResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            MESSAGE_ENUM.SOMETHING_WENT_WRONG
          );
        }
      } else {
        return res.sendErrorResponse(
          statusCodes.UNPROCESSABLE_ENTITY,
          MESSAGE_ENUM.REQUEST_FORGOT_PASSWORD_AGAIN
        );
      }
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }
  //-------------------------------------------------------------------------------
  async logout(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { refreshToken },
        userAgent,
      } = req;

      let JWT_Refresh_key = <string>config.jwt.REFRESH_KEY;
      const verified: any = jwt.verify(refreshToken, JWT_Refresh_key);

      if (verified) {
        if (verified.id === consumeUserId) {
          try {
            await authRepo.removeAccessTokens(consumeUserId, refreshToken);
          } catch (e: any) {
            return res.status(statusCodes.FORBIDDEN).send({
              status_code: statusCodes.FORBIDDEN,
              message: e.message,
              errors: "FORBIDDEN",
            });
          }

          // event log
          const eventLogInt = ENUM_EVENT_TYPE_LOGS.LOGOUT.id;
          const eventTypeLabel = ENUM_EVENT_TYPE_LOGS.LOGOUT.eventTypeName;
          const fullName = consumeUserFullName;
          const addEventData: addLogEventInterface = {
            alterRecordUserId: consumeUserId,
            userId: consumeUserId,
            userRoleId: consumeUserRole,
            alterRecordUserRoleId: consumeUserRole,
            userName: fullName,
            eventTypeLabel,
            eventTypeId: eventLogInt,
            userAgent,
            eventMessage: CUSTOMER_EVENT_MESSAGE.LOGGED_OUT.replace("%loginUserName%", fullName),
          };
          EventLogCustomEmitter.emit("add-event", addEventData);

          return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.LOGOUT_SUCCESSFULLY);
        } else {
          return res
            .status(statusCodes.FORBIDDEN)
            .send({ status_code: statusCodes.FORBIDDEN, message: "FORBIDDEN" });
        }
      } else {
        return res.sendErrorResponse(statusCodes.FORBIDDEN, MESSAGE_ENUM.ACCOUNT_DEACTIVE);
      }
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }
  //-------------------------------------------------------------------------------
  /**
   *
   * @param req
   * @param res
   * @returns
   */
  async updateRefreshToken(req: any, res: any) {
    try {
      const {
        body: { refreshToken: refresh_token },
      } = req;

      let JWT_Refresh_key = <string>config.jwt.REFRESH_KEY;
      const verified: any = jwt.verify(refresh_token, JWT_Refresh_key);

      // return res.status(statusCodes.OK).send(verified);

      if (verified) {
        let data: any = await userRepo.searchUser({
          id: verified.id,
          status: ENUM_User_Status.ACTIVE,
        });

        if (data) {
          const user_id = verified.id;
          const generateTokenPromise = super.generateAuthToken(user_id, "access");
          const generateRefreshTokenPromise = super.generateAuthToken(user_id, "refresh");

          Promise.all([generateTokenPromise, generateRefreshTokenPromise])
            .then(async (values: [string, string]) => {
              let [accessToken, refreshToken] = values;
              await authRepo.updateAcessToken(
                user_id,
                refresh_token,
                refreshToken,
                config.jwt.REFRESH_EXPIRES_IN
              );

              const data = {
                accessToken: accessToken,
                refreshToken,
                user: {
                  id: user_id,
                },
              };

              return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.PROVIDE_NEW_TOKEN, data);
            })
            .catch((err) => {
              return res.sendErrorResponse(
                statusCodes.SERVICE_UNAVAILABLE,
                MESSAGE_ENUM.SOMETHING_WENT_WRONG,
                { error: err.message }
              );
            });
        } else {
          return res.sendErrorResponse(statusCodes.FORBIDDEN, MESSAGE_ENUM.ACCOUNT_DEACTIVE);
        }
      } else {
        return res.sendErrorResponse(441, MESSAGE_ENUM.RefreshTokenExpired);
      }
    } catch (Error: any) {
      return res.sendErrorResponse(441, Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG, {
        errors: Error.message,
      });
    }
  }
}

export default new AuthController();
