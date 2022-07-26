import statusCodes from "http-status-codes";
import userRepo from "./users.repo";
import HelperController from "../auth/auth.helper";
import log from "../../helper/logs";
import { ENUM_EVENT_TYPE_LOGS, ENUM_User_ROLE, ENUM_User_Status } from "../../helper/constants";
import { sendEmail } from "../../helper/mail_ses";
import emailtemplates from "../../templates/emailTemplates";
import MESSAGE_ENUM from "../../helper/message";
import config from "../../config/app";
import { addLogEventInterface } from "../../customEvents/customEventInterface";
import EventLogCustomEmitter from "../../customEvents/customEventType";
import CUSTOMER_EVENT_MESSAGE from "../../customEvents/customEventMessage";
import { userMetaDataInterface } from "./user.interface";

class UserController extends HelperController {
  async getUsers(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        query: { filter, viewRoleList, sortBy, currentPage, recordPerPage },
      } = req;

      const sqlQuery = [];
      const sqlQueryParams = [];

      const sortObject: any = { column: "u.id", order: "desc" };
      const pageLimitObj = {
        limit: recordPerPage,
        offset: recordPerPage * currentPage - recordPerPage,
      };

      sqlQuery.push(` u.id != ? `);
      sqlQueryParams.push(consumeUserId);

      if (ENUM_User_ROLE.SUPERADMIN === consumeUserRole) {
        if (viewRoleList) {
          sqlQuery.push(` u.role = ?`);
          sqlQueryParams.push(viewRoleList);
        } else {
          sqlQuery.push(` u.role in (?,?,?) `);
          sqlQueryParams.push(ENUM_User_ROLE.SUPERADMIN);
          sqlQueryParams.push(ENUM_User_ROLE.ADMIN);
          sqlQueryParams.push(ENUM_User_ROLE.TEAM_MEMBER);
        }
      } else if (ENUM_User_ROLE.ADMIN === consumeUserRole) {
        sqlQuery.push(` u.role = ? `);
        sqlQueryParams.push(ENUM_User_ROLE.TEAM_MEMBER);
      }

      if (filter) {
        if (filter.firstLastAndEmail) {
          sqlQuery.push(`( u.firstName like ? or u.lastName like ? or u.email like ? )`);
          sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
          sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
          sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
        }
        if (filter.regionId) {
          sqlQuery.push(` u.regionId = ?`);
          sqlQueryParams.push(filter.regionId);
        }
      }

      if (sortBy) {
        for (let sortByKey in sortBy) {
          if (["firstName", "lastName", "email", "status", "role"].includes(sortByKey)) {
            sortObject.column = sortByKey;
            sortObject.order = sortBy[sortByKey];
          }
        }
      }

      let sqlQueryBuilder = sqlQuery.join(" and ");
      let sqlQueryBuilderList = sqlQueryParams;

      let userListCountPromise = userRepo.getUsersListCount(sqlQueryBuilder, sqlQueryBuilderList, {
        sortObject,
      });
      let userListPromise = userRepo.getUsersList(sqlQueryBuilder, sqlQueryBuilderList, {
        sortObject,
        pageLimit: pageLimitObj,
      });

      Promise.all([userListCountPromise, userListPromise])
        .then((values: [any, any]) => {
          let [userListCount, userList] = values;

          const totalPages = Math.ceil(userListCount / recordPerPage);
          const data = {
            viewRoleList,
            records: userList,
            recordsMetaData: {
              recordPerPage,
              currentPage,
              totalPages,
              totalRecords: userListCount,
            },
          };

          return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.LIST, data);
        })
        .catch((e: any) => {
          return res.sendErrorResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            MESSAGE_ENUM.SOMETHING_WENT_WRONG,
            { error: e }
          );
        });
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async addUser(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { role, firstName, lastName, email, temporaryPassword, regionId, phoneNumber },
        userAgent,
      } = req;

      const websiteLink: string = <string>config.web.LINK;
      const createSaltPromise = super.createSalt();

      let user: any = {};
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.role = role;
      user.setTemporaryPassword = 1;

      if (ENUM_User_ROLE.TEAM_MEMBER === role) {
        user.regionId = regionId;
        user.phoneNumber = phoneNumber;
      }

      const salt = await createSaltPromise;
      const hash = await super.createHash(salt, email, temporaryPassword);

      user.salt = salt;
      user.hash = hash;

      if (ENUM_User_ROLE.ADMIN === consumeUserRole) {
        if (ENUM_User_ROLE.SUPERADMIN === role || ENUM_User_ROLE.ADMIN === role) {
          return res.sendErrorResponse(
            statusCodes.FORBIDDEN,
            MESSAGE_ENUM.CANNOT_ADD_USER_BY_ADMIN
          );
        }
      }

      let userId: number;
      try {
        userId = <number>await userRepo.createUser(user, consumeUserId);
      } catch (error: any) {
        let message = error.sqlMgs;
        if (error.errNo === 1062) {
          message = MESSAGE_ENUM.EMAILT_ALREADY_EXIST;
        }
        return res.sendErrorResponse(statusCodes.CONFLICT, message, { error: error.sqlMgs });
      }

      const mailSetTemporaryPasswordData = {
        websiteLink: websiteLink,
        firstName: user.firstName,
        userEmail: user.email,
        temporaryPassword: req.body.temporaryPassword,
      };
      sendEmail(
        [user.email],
        emailtemplates.welcomeEmail.subject,
        emailtemplates.welcomeEmail.returnHtml(mailSetTemporaryPasswordData)
      );

      // event log
      let eventLogInt = 10000;
      let eventTypeLabel = "10000";
      switch (role) {
        case ENUM_User_ROLE.SUPERADMIN:
          eventLogInt = ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_CREATED.id;
          eventTypeLabel = ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_CREATED.eventTypeName;
          break;
        case ENUM_User_ROLE.ADMIN:
          eventLogInt = ENUM_EVENT_TYPE_LOGS.ADMIN_CREATED.id;
          eventTypeLabel = ENUM_EVENT_TYPE_LOGS.ADMIN_CREATED.eventTypeName;
          break;
        case ENUM_User_ROLE.TEAM_MEMBER:
          eventLogInt = ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_CREATED.id;
          eventTypeLabel = ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_CREATED.eventTypeName;
          break;
      }

      const fullName = consumeUserFullName;
      const addEventData: addLogEventInterface = {
        alterRecordUserId: userId,
        userId: consumeUserId,
        userRoleId: consumeUserRole,
        alterRecordUserRoleId: role,
        userName: fullName,
        eventTypeId: eventLogInt,
        eventTypeLabel,
        userAgent,
        eventMessage: CUSTOMER_EVENT_MESSAGE.USER_CREATED.replace(
          "%loginUserName%",
          fullName
        ).replace("%createdBy%", firstName + " " + lastName),
      };
      EventLogCustomEmitter.emit("add-event", addEventData);

      return res.sendSucessResponse(statusCodes.CREATED, MESSAGE_ENUM.USER_CREATED_SUCCESSFULLY, {
        id: userId,
      });
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async updateUser(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { role },
        params: { userId },
        userAgent,
      } = req;

      let user: any = await userRepo.searchUser({ id: userId });

      if (!user) {
        return res.sendErrorResponse(
          statusCodes.UNPROCESSABLE_ENTITY,
          MESSAGE_ENUM.RECORD_NOT_FOUND
        );
      }

      super.validateCurrentRoleAuthorize(consumeUserRole, user.role);

      if (user.role === ENUM_User_ROLE.TEAM_MEMBER) {
        if (!req.body.regionId || !req.body.phoneNumber) {
          return res.sendErrorResponse(
            statusCodes.UNPROCESSABLE_ENTITY,
            MESSAGE_ENUM.RECORD_NOT_FOUND
          );
        }

        user.phoneNumber = req.body.phoneNumber;
        user.regionId = req.body.regionId;
      } else {
        user.phoneNumber = null;
        user.regionId = null;
      }

      const previousUserMetaData: userMetaDataInterface = await userRepo.userMetaData(userId);

      delete user.id;

      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;

      await userRepo.updateUser(userId, user);

      let updateData: any = await userRepo.searchUser({ id: userId });

      // event log
      let eventLogInt = 10002;
      let eventTypeLabel = "10002";
      switch (user.role) {
        case ENUM_User_ROLE.SUPERADMIN:
          eventLogInt = ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_UPDATED.id;
          eventTypeLabel = ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_UPDATED.eventTypeName;
          break;
        case ENUM_User_ROLE.ADMIN:
          eventLogInt = ENUM_EVENT_TYPE_LOGS.ADMIN_UPDATED.id;
          eventTypeLabel = ENUM_EVENT_TYPE_LOGS.ADMIN_UPDATED.eventTypeName;
          break;
        case ENUM_User_ROLE.TEAM_MEMBER:
          eventLogInt = ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_UPDATED.id;
          eventTypeLabel = ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_UPDATED.eventTypeName;
          break;
      }

      const currentUserMetaData: userMetaDataInterface = await userRepo.userMetaData(userId);

      const fullName = consumeUserFullName;
      const addEventData: addLogEventInterface = {
        alterRecordUserId: userId,
        userId: consumeUserId,
        userRoleId: consumeUserRole,
        alterRecordUserRoleId: user.role,
        userName: fullName,
        eventTypeId: eventLogInt,
        eventTypeLabel,
        userAgent,
        eventMessage: CUSTOMER_EVENT_MESSAGE.USER_UPDATED.replace(
          "%loginUserName%",
          fullName
        ).replace("%user2%", updateData.firstName + " " + updateData.lastName),
      };
      addEventData.changes = {
        meta: {
          label: "User Update",
          previous_value_updated_user_id:
            previousUserMetaData.updatedUserId || previousUserMetaData.createdUserId,
          previous_value_updated_by:
            previousUserMetaData.updatedFullName || previousUserMetaData.createdFullName,
          previous_value_updated_on:
            previousUserMetaData.userUpdatedAt || previousUserMetaData.userCreatedAt,
          current_value_updated_user_id: consumeUserId,
          current_value_updated_by: consumeUserFullName,
          current_value_updated_on:
            currentUserMetaData.userUpdatedAt || currentUserMetaData.userCreatedAt,
        },
        event_changes: [
          {
            label: "First Name",
            previous_value: previousUserMetaData.firstName,
            current_value: updateData.firstName,
          },
          {
            label: "Last Name",
            previous_value: previousUserMetaData.lastName,
            current_value: updateData.lastName,
          },
          {
            label: "Email",
            previous_value: previousUserMetaData.email,
            current_value: updateData.email,
          },
        ],
      };

      if (user.role === ENUM_User_ROLE.TEAM_MEMBER) {
        addEventData.changes.event_changes.push({
          label: "Region",
          previous_value: <string>previousUserMetaData.regionName,
          current_value: <string>currentUserMetaData.regionName,
        });
      }

      EventLogCustomEmitter.emit("add-event", addEventData);

      const data = {
        id: updateData.id,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        role: updateData.role,
        phoneNumber: updateData.phoneNumber,
        regionId: updateData.regionId,
      };

      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.PROFILE_UPDATE_SUCCESSFULLY, data);
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async patchUserStatus(req: any, res: any) {
    try {
      const {
        userAgent,
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { status },
        params: { userId },
      } = req;

      const condition = { id: userId };
      const userFind: any = await userRepo.searchUser(condition);

      if (!userFind) {
        return res.sendErrorResponse(
          statusCodes.UNPROCESSABLE_ENTITY,
          MESSAGE_ENUM.RECORD_NOT_FOUND
        );
      }

      super.validateCurrentRoleAuthorize(consumeUserRole, userFind.role);

      let updateUserCondition: { status?: number } = {};
      updateUserCondition.status = status;

      delete userFind.id;

      if (userFind.status !== status) {
        await userRepo.updateUser(userId, updateUserCondition);

        // event log
        let eventLogInt = 10001;
        let eventTypeLog = "10001";
        let eventTypeLabel = "10001";
        switch (status) {
          case ENUM_User_Status.ACTIVE:
            if (userFind.role === ENUM_User_ROLE.SUPERADMIN) {
              eventLogInt = ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_ACTIVATED.id;
              eventTypeLabel = ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_ACTIVATED.eventTypeName;
            } else if (userFind.role === ENUM_User_ROLE.ADMIN) {
              eventLogInt = ENUM_EVENT_TYPE_LOGS.ADMIN_ACTIVATED.id;
              eventTypeLabel = ENUM_EVENT_TYPE_LOGS.ADMIN_ACTIVATED.eventTypeName;
            } else if (userFind.role === ENUM_User_ROLE.TEAM_MEMBER) {
              eventLogInt = ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_ACTIVATED.id;
              eventTypeLabel = ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_ACTIVATED.eventTypeName;
            }

            eventTypeLog = CUSTOMER_EVENT_MESSAGE.USER_ACTIVE;
            break;
          case ENUM_User_Status.INACTIVE:
            eventTypeLog = CUSTOMER_EVENT_MESSAGE.USER_DEACTIVE;

            if (userFind.role === ENUM_User_ROLE.SUPERADMIN) {
              eventLogInt = ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_DEACTIVATED.id;
              eventTypeLabel = ENUM_EVENT_TYPE_LOGS.SUPER_ADMIN_DEACTIVATED.eventTypeName;
            } else if (userFind.role === ENUM_User_ROLE.ADMIN) {
              eventLogInt = ENUM_EVENT_TYPE_LOGS.ADMIN_DEACTIVATED.id;
              eventTypeLabel = ENUM_EVENT_TYPE_LOGS.ADMIN_DEACTIVATED.eventTypeName;
            } else if (userFind.role === ENUM_User_ROLE.TEAM_MEMBER) {
              eventLogInt = ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_DEACTIVATED.id;
              eventTypeLabel = ENUM_EVENT_TYPE_LOGS.TEAM_MEMBER_DEACTIVATED.eventTypeName;
            }

            break;
        }

        const fullName = consumeUserFullName;
        const addEventData: addLogEventInterface = {
          alterRecordUserId: userId,
          userId: consumeUserId,
          userRoleId: consumeUserRole,
          alterRecordUserRoleId: userFind.role,
          userName: fullName,
          eventTypeId: eventLogInt,
          eventTypeLabel,
          userAgent,
          eventMessage: eventTypeLog
            .replace("%loginUserName%", fullName)
            .replace("%user2%", userFind.fullName),
        };
        EventLogCustomEmitter.emit("add-event", addEventData);

        return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.STATUS_CHANGE_SUCCESSFULLY);
      } else {
        return res.sendErrorResponse(
          statusCodes.UNPROCESSABLE_ENTITY,
          MESSAGE_ENUM.STATUS_IS_ALREADY_SAME
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

  async pathSetTemporaryPassword(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { setTemporaryPassword },
        params: { userId },
        userAgent,
      } = req;
      const websiteLink: string = <string>config.web.LINK;
      const condition = { id: userId };
      const userFind: any = await userRepo.searchUser(condition);
      if (!userFind) {
        return res.sendErrorResponse(
          statusCodes.UNPROCESSABLE_ENTITY,
          MESSAGE_ENUM.RECORD_NOT_FOUND
        );
      }

      super.validateCurrentRoleAuthorize(consumeUserRole, userFind.role);

      if (userFind.status === ENUM_User_Status.PENDING) {
        return res.sendErrorResponse(
          statusCodes.FORBIDDEN,
          MESSAGE_ENUM.CANNOT_RESET_PASSWORD_PENDING_STATUS_USER
        );
      }

      let salt = userFind.salt;
      if (!userFind.salt) {
        salt = await super.createSalt();
      }
      const hash = await super.createHash(salt, userFind.email, setTemporaryPassword);

      const updateUserDate = { setTemporaryPassword: 1, salt, hash };
      const isUserUpdated = await userRepo.updateUser(userId, updateUserDate);

      log.info([condition, "patchSetPassword"]);
      if (isUserUpdated) {
        const user_email = userFind.email;

        const mailSetTemporaryPasswordData = {
          websiteLink: websiteLink,
          firstName: userFind.firstName,
          userEmail: userFind.email,
          temporaryPassword: setTemporaryPassword,
        };

        sendEmail(
          [user_email],
          emailtemplates.setTemporaryPassword.subject,
          emailtemplates.setTemporaryPassword.returnHtml(mailSetTemporaryPasswordData)
        );

        // event log
        const eventLogInt = ENUM_EVENT_TYPE_LOGS.RESET_PASSWORD.id;
        const eventTypeLabel = ENUM_EVENT_TYPE_LOGS.RESET_PASSWORD.eventTypeName;

        const addEventData: addLogEventInterface = {
          alterRecordUserId: userId,
          userId: consumeUserId,
          userRoleId: consumeUserRole,
          alterRecordUserRoleId: userFind.role,
          userName: consumeUserFullName,
          eventTypeId: eventLogInt,
          eventTypeLabel,
          userAgent,
          eventMessage: CUSTOMER_EVENT_MESSAGE.RESET_PASSWORD_OTHER.replace(
            "%loginUserName%",
            consumeUserFullName
          ).replace("%user2%", userFind.firstName + " " + userFind.lastName),
        };
        EventLogCustomEmitter.emit("add-event", addEventData);

        return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.SET_TEMPORARY_PASSWORD);
      } else {
        return res.sendErrorResponse(
          statusCodes.INTERNAL_SERVER_ERROR,
          MESSAGE_ENUM.SOMETHING_WENT_WRONG
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
}

export default new UserController();
