import { NextFunction, Request, Response } from "express";
import statusCodes from "http-status-codes";
import customerRepo from "./customers.repo";
import userRepo from "../users/users.repo";
import HelperController from "../auth/auth.helper";
import log from "../../helper/logs";
import {
  ENUM_User_ROLE,
  ENUM_User_Status,
  ENUM_PREFIX_FILE_PATH,
  ENUM_PERMISSION,
  ENUM_EVENT_TYPE_LOGS,
} from "../../helper/constants";
import { sendEmail } from "../../helper/mail_ses";
import emailtemplates from "../../templates/emailTemplates";
import config from "../../config/app";
import documentsRepo from "../documents/documents.repo";
import documentTypeRepo from "../documenttypes/documenttypes.repo";
import {
  createPresignedPost as _createPresignedPost,
  createCloudFrontPresigned as _createCloudFrontPresigned,
} from "../../helper/s3-service";
import MESSAGE_ENUM from "../../helper/message";
import {
  companyDataModel,
  companyMetaDataInterface,
  getMultipleDocumentsModal,
  isDocumentAssignToCompanyModal,
} from "./customer.interface";
import ForbiddenError from "../../helper/error/forbiddenError";
import { multipleDownload as _multipleDownload } from "../../helper/lambda";
import {
  companyAddLogEventInterface,
  documentAddLogEventInterface,
} from "../../customEvents/customEventInterface";
import EventLogCustomEmitter from "../../customEvents/customEventType";
import CUSTOMER_EVENT_MESSAGE from "../../customEvents/customEventMessage";
import { documentMetaDataInterface } from "../documents/document.interface";
import { userMetaDataInterface } from "../users/user.interface";

class CustomerController extends HelperController {
  async getCustomers(req: any, res: any) {
    try {
      const {
        user: { id, role: consumeUserRole },
        query: { filter, sortBy, currentPage, recordPerPage },
      } = req;

      const sqlQuery = [];
      const sqlQueryParams = [];

      const sortObject: any = { column: "c.id", order: "desc" };
      const pageLimitObj = {
        limit: recordPerPage,
        offset: recordPerPage * currentPage - recordPerPage,
      };

      sqlQuery.push(` u.role = ? `);
      sqlQueryParams.push(ENUM_User_ROLE.CUSTOMER_USER);
      sqlQuery.push(` cu.isCompanyOwner = ? `);
      sqlQueryParams.push(true);

      if (consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER) {
        sqlQuery.push(` atm.assignUserId = ? `);
        sqlQueryParams.push(id);
      }

      if (filter) {
        if (filter.firstLastAndUnique) {
          sqlQuery.push(`( u.firstName like ? or u.lastName like ? or c.uniqueId like ? )`);
          sqlQueryParams.push(`%${filter.firstLastAndUnique}%`);
          sqlQueryParams.push(`%${filter.firstLastAndUnique}%`);
          sqlQueryParams.push(`%${filter.firstLastAndUnique}%`);
        }
        if (filter.regionId) {
          sqlQuery.push(` c.regionId = ?`);
          sqlQueryParams.push(filter.regionId);
        }
      }

      if (sortBy) {
        for (let sortByKey in sortBy) {
          if (
            ["companyName", "uniqueId", "firstName", "lastName", "email", "status"].includes(
              sortByKey
            )
          ) {
            sortObject.column = sortByKey;
            sortObject.order = sortBy[sortByKey];
          }
        }
      }

      let sqlQueryBuilder = sqlQuery.join(" and ");
      let sqlQueryBuilderList = sqlQueryParams;

      let userListCountPromise = customerRepo.getCompanyListCount(
        sqlQueryBuilder,
        sqlQueryBuilderList,
        { sortObject }
      );
      let userListPromise = customerRepo.getCompanyList(sqlQueryBuilder, sqlQueryBuilderList, {
        sortObject,
        pageLimit: pageLimitObj,
      });

      Promise.all([userListCountPromise, userListPromise])
        .then((values: [any, any]) => {
          let [userListCount, userList] = values;

          const totalPages = Math.ceil(userListCount / recordPerPage);
          const data = {
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
          log.error(["getCustomers: catch::", e]);
          return res.sendErrorResponse(
            statusCodes.SERVICE_UNAVAILABLE,
            MESSAGE_ENUM.SOMETHING_WENT_WRONG,
            { errors: e.message }
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

  async addCustomer(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { customerUser, companyInfo },
        userAgent,
      } = req;

      let {
        body: { assignedTeamMember },
      } = req;

      if (consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER) {
        assignedTeamMember = [consumeUserId];
      }

      const isAllIdsAreTeamMembers = await customerRepo.checkAllTeamMemberIds(assignedTeamMember);
      if (isAllIdsAreTeamMembers.length !== assignedTeamMember.length) {
        return res.sendErrorResponse(
          statusCodes.CONFLICT,
          MESSAGE_ENUM.ALL_IDS_ARE_NOT_TEAM_MEMBERS
        );
      }

      const salt = await super.createSalt();
      const hash = await super.createHash(salt, customerUser.email, customerUser.temporaryPassword);

      customerUser.salt = salt;
      customerUser.hash = hash;
      customerUser.setTemporaryPassword = 1;
      customerUser.role = ENUM_User_ROLE.CUSTOMER_USER;

      const temporaryPassword = customerUser.temporaryPassword;
      delete customerUser.temporaryPassword;

      const addCompany = { customerUser, companyInfo, assignedTeamMember };

      let userAndCompanyAndTeamMemberObjId;
      try {
        userAndCompanyAndTeamMemberObjId = await customerRepo.createUser(addCompany, consumeUserId);
      } catch (error: any) {
        let message = error.sqlMgs;
        if (error.errNo === 1062) {
          if (message.includes("users.users_email_unique")) {
            message = MESSAGE_ENUM.EMAIL_ALREADY_EXIST;
          } else if (message.includes("companies.companies_companyname_unique")) {
            message = MESSAGE_ENUM.COMPANY_NAME_ALREADY_EXIST;
          } else if (message.includes("companies.companies_uniqueid_unique")) {
            message = MESSAGE_ENUM.COMPANY_UNIQUE_ALREADY_EXIST;
          }
        }
        return res.sendErrorResponse(statusCodes.CONFLICT, message, {
          error: error.sqlMgs,
          error1: error,
        });
      }

      const websiteLink: string = <string>config.web.LINK;

      const mailSetTemporaryPasswordData = {
        websiteLink: websiteLink,
        firstName: customerUser.firstName,
        userEmail: customerUser.email,
        temporaryPassword: temporaryPassword,
      };
      sendEmail(
        [customerUser.email],
        emailtemplates.welcomeEmail.subject,
        emailtemplates.welcomeEmail.returnHtml(mailSetTemporaryPasswordData)
      );

      // event log
      const eventLogInt = ENUM_EVENT_TYPE_LOGS.CUSTOMER_CREATED.id;
      const eventTypeLabel = ENUM_EVENT_TYPE_LOGS.CUSTOMER_CREATED.eventTypeName;

      const fullName = consumeUserFullName;
      const addEventData: companyAddLogEventInterface = {
        alterRecordUserId: userAndCompanyAndTeamMemberObjId.userId,
        companyId: userAndCompanyAndTeamMemberObjId.companyId,
        companyName: companyInfo.companyName,
        userId: consumeUserId,
        userRoleId: consumeUserRole,
        alterRecordUserRoleId: ENUM_User_ROLE.CUSTOMER_USER,
        userName: fullName,
        eventTypeId: eventLogInt,
        eventTypeLabel,
        userAgent,
        eventMessage: CUSTOMER_EVENT_MESSAGE.USER_CREATED.replace(
          "%loginUserName%",
          fullName
        ).replace("%createdBy%", customerUser.firstName + " " + customerUser.lastName),
      };
      EventLogCustomEmitter.emit("add-event", addEventData);

      return res.sendSucessResponse(statusCodes.CREATED, MESSAGE_ENUM.COMPANY_CREATED, {
        id: userAndCompanyAndTeamMemberObjId.companyId,
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

  async putCustomer(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { customerUser, companyInfo },
        params: { companyId },
        userAgent,
      } = req;

      let {
        body: { assignedTeamMember },
      } = req;

      const companyData: companyDataModel = await super.validateCompanyId(companyId);

      if (companyData.userStatus == ENUM_User_Status.INACTIVE) {
        return res.sendErrorResponse(
          statusCodes.FORBIDDEN,
          MESSAGE_ENUM.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT
        );
      }

      super.validateCurrentRoleAuthorize(consumeUserRole, companyData.userRole);
      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      const isAllIdsAreTeamMembers = await customerRepo.checkAllTeamMemberIds(assignedTeamMember);
      if (isAllIdsAreTeamMembers.length !== assignedTeamMember.length) {
        return res.sendErrorResponse(
          statusCodes.CONFLICT,
          MESSAGE_ENUM.ALL_IDS_ARE_NOT_TEAM_MEMBERS
        );
      }

      const companyAliasUserId = <{ companyId: number; userId: number }>(
        await customerRepo.getUserIdFromCompanyId(companyId)
      );

      const updateCompany = { customerUser, companyInfo, assignedTeamMember };

      const isCompanyNameUnique = await customerRepo.isCompanyNameUnique(
        companyInfo.companyName,
        companyId
      );
      if (!isCompanyNameUnique) {
        return res.sendErrorResponse(statusCodes.CONFLICT, MESSAGE_ENUM.COMPANY_NAME_ALREADY_EXIST);
      }

      const isCompanyUniqueIdUnique = await customerRepo.isCompanyUniqueIdUnique(
        companyInfo.uniqueId,
        companyId
      );
      if (!isCompanyUniqueIdUnique) {
        return res.sendErrorResponse(
          statusCodes.CONFLICT,
          MESSAGE_ENUM.COMPANY_UNIQUE_ALREADY_EXIST
        );
      }

      const previousUserMetaData: companyMetaDataInterface = await customerRepo.companyMetaData(
        companyId
      );
      const previousCompanyAssignTeamMemberMetaList: any =
        await customerRepo.companyAssignTeamMemberMetaList(companyId);
      const previousCompanyAssignTML = previousCompanyAssignTeamMemberMetaList.map(
        (rec: any) => rec.id
      );

      let userAndCompanyAndTeamMemberObjId;
      try {
        // for team member- assign_team_members will not effect. it will remain same
        userAndCompanyAndTeamMemberObjId = await customerRepo.updateCompany(
          consumeUserRole,
          companyAliasUserId,
          updateCompany,
          consumeUserId
        );
      } catch (error: any) {
        let message = error.sqlMgs;
        return res.sendErrorResponse(statusCodes.CONFLICT, message, { error: error.sqlMgs });
      }

      const currentUserMetaData: companyMetaDataInterface = await customerRepo.companyMetaData(
        companyId
      );
      const currentCompanyAssignTeamMemberMetaList: any =
        await customerRepo.companyAssignTeamMemberMetaList(companyId);

      let previouslyRemoved = previousCompanyAssignTeamMemberMetaList.filter(
        (x: any) => !assignedTeamMember.includes(x.id)
      );
      let exitBothTmList = previousCompanyAssignTeamMemberMetaList.filter((x: any) =>
        assignedTeamMember.includes(x.id)
      );
      let currentAdded = currentCompanyAssignTeamMemberMetaList.filter(
        (x: any) => !previousCompanyAssignTML.includes(x.id)
      );

      let maxLoopTMLLIST =
        currentAdded.length > previouslyRemoved.length
          ? currentAdded.length
          : previouslyRemoved.length;

      let assignedTMAuditList = [];
      for (let i = 0; i < maxLoopTMLLIST; i++) {
        assignedTMAuditList.push({
          label: "",
          previous_value: previouslyRemoved[i]
            ? previouslyRemoved[i]["firstName"] + " " + previouslyRemoved[i]["lastName"]
            : "",
          previous_sub_heading: previouslyRemoved[i] ? previouslyRemoved[i]["email"] : "",
          current_value: currentAdded[i]
            ? currentAdded[i]["firstName"] + " " + currentAdded[i]["lastName"]
            : "",
          current_sub_heading: currentAdded[i] ? currentAdded[i]["email"] : "",
        });
      }
      for (let rec of exitBothTmList) {
        assignedTMAuditList.push({
          label: "",
          previous_value: rec["firstName"] + " " + rec["lastName"],
          previous_sub_heading: rec["email"],
          current_value: rec["firstName"] + " " + rec["lastName"],
          current_sub_heading: rec["email"],
        });
      }

      // event log
      const eventLogInt = ENUM_EVENT_TYPE_LOGS.CUSTOMER_UPDATED.id;
      const eventTypeLabel = ENUM_EVENT_TYPE_LOGS.CUSTOMER_UPDATED.eventTypeName;

      const fullName = consumeUserFullName;
      const addEventData: companyAddLogEventInterface = {
        alterRecordUserId: companyData.userId,
        companyId,
        companyName: companyData.companyName,
        userId: consumeUserId,
        userRoleId: consumeUserRole,
        alterRecordUserRoleId: companyData.userRole,
        userName: fullName,
        eventTypeId: eventLogInt,
        eventTypeLabel,
        userAgent,
        eventMessage: CUSTOMER_EVENT_MESSAGE.USER_UPDATED.replace(
          "%loginUserName%",
          fullName
        ).replace("%user2%", customerUser.firstName + " " + customerUser.lastName),
      };
      addEventData.changes = [
        {
          meta: {
            label: "Customer Info",
            previous_value_updated_user_id:
              previousUserMetaData.updatedUserId || previousUserMetaData.createdUserId,
            previous_value_updated_by:
              previousUserMetaData.updatedFullName || previousUserMetaData.createdFullName,
            previous_value_updated_on:
              previousUserMetaData.companyUpdatedAt || previousUserMetaData.companyCreatedAt,
            current_value_updated_user_id: consumeUserId,
            current_value_updated_by: consumeUserFullName,
            current_value_updated_on:
              currentUserMetaData.companyUpdatedAt || currentUserMetaData.companyCreatedAt,
          },
          event_changes: [
            {
              label: "Account Name",
              previous_value: previousUserMetaData.companyName,
              current_value: companyInfo.companyName,
            },
            {
              label: "Address",
              previous_value: previousUserMetaData.companyAddress,
              current_value: companyInfo.companyAddress,
            },
            {
              label: "Unique Id",
              previous_value: previousUserMetaData.uniqueId,
              current_value: companyInfo.uniqueId,
            },
            {
              label: "Region",
              previous_value: previousUserMetaData.companyRegionName,
              current_value: currentUserMetaData.companyRegionName,
            },
            {
              label: "First Name",
              previous_value: previousUserMetaData.firstName,
              current_value: customerUser.firstName,
            },
            {
              label: "Last Name",
              previous_value: previousUserMetaData.lastName,
              current_value: customerUser.lastName,
            },
            {
              label: "Email",
              previous_value: previousUserMetaData.email,
              current_value: currentUserMetaData.email,
            },
          ],
        },
        {
          meta: {
            label: "Assigned Team Members",
            previous_value_updated_user_id:
              previousUserMetaData.updatedUserId || previousUserMetaData.createdUserId,
            previous_value_updated_by:
              previousUserMetaData.updatedFullName || previousUserMetaData.createdFullName,
            previous_value_updated_on:
              previousUserMetaData.companyUpdatedAt || previousUserMetaData.companyCreatedAt,
            current_value_updated_user_id: consumeUserId,
            current_value_updated_by: consumeUserFullName,
            current_value_updated_on:
              currentUserMetaData.companyUpdatedAt || currentUserMetaData.companyCreatedAt,
          },
          event_changes: assignedTMAuditList,
        },
      ];

      EventLogCustomEmitter.emit("add-event", addEventData);

      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.COMPANY_PROFILE_UPDATED, {
        id: companyId,
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

  async patchCustomerStatus(req: any, res: any) {
    try {
      // status should be 1 or 2
      const {
        userAgent,
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { status },
        params: { companyId },
      } = req;

      const companyData: companyDataModel = await super.validateCompanyId(companyId);

      const { userId } = <{ companyId: number; userId: number }>(
        await customerRepo.getUserIdFromCompanyId(companyId)
      );

      const condition = { id: userId, role: ENUM_User_ROLE.CUSTOMER_USER };
      log.info([condition, "patchCustomerStatus"]);
      const userFind: { role: number; status: number; fullName: string } = <
        { role: number; status: number; fullName: string }
      >await userRepo.searchUser(condition);

      super.validateCurrentRoleAuthorize(consumeUserRole, userFind.role);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      if (userFind.status !== status) {
        try {
          await customerRepo.updateCompanyStatus(companyId, status);
        } catch (e: any) {
          return res.sendErrorResponse(statusCodes.SERVICE_UNAVAILABLE, e.message, {
            errors: e.message,
          });
        }

        // event log
        let eventLogInt = 10003;
        let eventTypeLog = "10003";
        let eventTypeLabel = "1003";

        switch (status) {
          case ENUM_User_Status.ACTIVE:
            eventLogInt = ENUM_EVENT_TYPE_LOGS.CUSTOMER_ACTIVATED.id;
            eventTypeLabel = ENUM_EVENT_TYPE_LOGS.CUSTOMER_ACTIVATED.eventTypeName;
            eventTypeLog = CUSTOMER_EVENT_MESSAGE.USER_ACTIVE;

            break;
          case ENUM_User_Status.INACTIVE:
            eventLogInt = ENUM_EVENT_TYPE_LOGS.CUSTOMER_DEACTIVATED.id;
            eventTypeLabel = ENUM_EVENT_TYPE_LOGS.CUSTOMER_DEACTIVATED.eventTypeName;
            eventTypeLog = CUSTOMER_EVENT_MESSAGE.USER_DEACTIVE;

            break;
        }

        const fullName = consumeUserFullName;
        const addEventData: companyAddLogEventInterface = {
          alterRecordUserId: userId,
          companyId,
          companyName: companyData.companyName,
          userId: consumeUserId,
          userRoleId: consumeUserRole,
          alterRecordUserRoleId: ENUM_User_ROLE.CUSTOMER_USER,
          userName: fullName,
          eventTypeId: eventLogInt,
          eventTypeLabel,
          userAgent,
          eventMessage: eventTypeLog
            .replace("%loginUserName%", fullName)
            .replace("%user2%", userFind.fullName),
        };
        EventLogCustomEmitter.emit("add-event", addEventData);

        return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.STATUS_CHANGED_SUCCESSFULLY);
      } else {
        return res.sendErrorResponse(
          statusCodes.UNPROCESSABLE_ENTITY,
          MESSAGE_ENUM.STATUS_ALREADY_SAME
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

  async getCompanyDetail(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        body: { status },
        params: { companyId },
      } = req;

      await super.validateCompanyId(companyId);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      if (consumeUserRole === ENUM_User_ROLE.CUSTOMER_USER) {
        await super.validateIsCompayUserAssignToCompany(consumeUserId, companyId);
      }

      const companydetailPromise = customerRepo.companydetail(companyId);

      const companyDetail: any = await companydetailPromise;

      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.COMPANY_DETAIL, companyDetail);
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async addCompanyUser(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { firstName, lastName, email, temporaryPassword },
        params: { companyId },
        userAgent,
      } = req;

      const websiteLink: string = <string>config.web.LINK;

      const companyData: companyDataModel = await super.validateCompanyId(companyId);
      super.validateCurrentRoleAuthorize(consumeUserRole, companyData.userRole);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      let user: any = {};
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.role = ENUM_User_ROLE.CUSTOMER_USER;
      user.setTemporaryPassword = 1;

      const salt = await super.createSalt();
      const hash = await super.createHash(salt, email, temporaryPassword);

      user.salt = salt;
      user.hash = hash;

      let userId: number;
      try {
        userId = <number>await customerRepo.createCompanyUser(consumeUserId, companyId, user);
      } catch (error: any) {
        let message = error.sqlMgs;
        if (error.errNo === 1062) {
          message = MESSAGE_ENUM.EMAILT_ALREADY_EXIST;
        }
        return res.sendErrorResponse(statusCodes.CONFLICT, message, { error: error.sqlMg });
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
      const eventLogInt = ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_CREATED.id;
      const eventTypeLabel = ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_CREATED.eventTypeName;

      const fullName = consumeUserFullName;
      const addEventData: companyAddLogEventInterface = {
        alterRecordUserId: userId,
        companyId,
        companyName: companyData.companyName,
        userId: consumeUserId,
        userRoleId: consumeUserRole,
        alterRecordUserRoleId: ENUM_User_ROLE.CUSTOMER_USER,
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

      return res.sendSucessResponse(statusCodes.CREATED, MESSAGE_ENUM.COMPANY_USER_CREATED, {
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

  async companyUserList(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        query: { filter, sortBy, currentPage, recordPerPage },
        params: { companyId: companyId1 },
      } = req;

      const sqlQuery = [];
      const sqlQueryParams = [];

      const companyId = parseInt(companyId1);

      const condition: any = {};
      const sortObject: any = { column: "u.id", order: "desc" };
      const pageLimitObj = {
        limit: recordPerPage,
        offset: recordPerPage * currentPage - recordPerPage,
      };

      const companyData: companyDataModel = await super.validateCompanyId(companyId);
      super.validateCurrentRoleAuthorize(consumeUserRole, companyData.userRole);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      sqlQuery.push(` u.id != ? `);
      sqlQueryParams.push(consumeUserId);
      sqlQuery.push(` cu.companyId = ? `);
      sqlQueryParams.push(companyId);

      sqlQuery.push(` u.role = ? `);
      sqlQueryParams.push(ENUM_User_ROLE.CUSTOMER_USER);

      if (filter) {
        if (filter.firstLastAndEmail) {
          sqlQuery.push(`( u.firstName like ? or  u.lastName like ? or  u.email like ? )`);
          sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
          sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
          sqlQueryParams.push(`%${filter.firstLastAndEmail}%`);
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

      let userListCountPromise = customerRepo.getCompanyUsersListCount(
        sqlQueryBuilder,
        sqlQueryBuilderList,
        { sortObject }
      );
      let userListPromise = customerRepo.getCompanyUsersList(sqlQueryBuilder, sqlQueryBuilderList, {
        sortObject,
        pageLimit: pageLimitObj,
      });

      Promise.all([userListCountPromise, userListPromise])
        .then((values: [any, any]) => {
          let [userListCount, userList] = values;

          const totalPages = Math.ceil(userListCount / recordPerPage);
          const data = {
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
            statusCodes.SERVICE_UNAVAILABLE,
            MESSAGE_ENUM.SOMETHING_WENT_WRONG,
            { errors: e.message }
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

  async companyUserUpdate(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { role },
        params: { userId, companyId },
        userAgent,
      } = req;

      const companyData: companyDataModel = await super.validateCompanyId(companyId);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      await super.validateIsCompayUserAssignToCompany(userId, companyId);

      let user: any = await userRepo.searchUser({ id: userId });
      const previousUserMetaData: userMetaDataInterface = await userRepo.userMetaData(userId);

      super.validateCurrentRoleAuthorize(consumeUserRole, user.role);

      delete user.id;

      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.phoneNumber = null;
      user.regionId = null;

      await userRepo.updateUser(userId, user);
      let updateData: any = await userRepo.searchUser({ id: userId });

      const response = {
        id: updateData.id,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        role: updateData.role,
        phoneNumber: updateData.phoneNumber,
        regionId: updateData.regionId,
      };

      // event log
      const eventLogInt = ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_UPDATED.id;
      const eventTypeLabel = ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_UPDATED.eventTypeName;

      const fullName = consumeUserFullName;
      const addEventData: companyAddLogEventInterface = {
        alterRecordUserId: userId,
        companyId,
        companyName: companyData.companyName,
        userId: consumeUserId,
        userRoleId: consumeUserRole,
        alterRecordUserRoleId: ENUM_User_ROLE.CUSTOMER_USER,
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
          label: "User Updated",
          previous_value_updated_user_id:
            previousUserMetaData.updatedUserId || previousUserMetaData.createdUserId,
          previous_value_updated_by:
            previousUserMetaData.updatedFullName || previousUserMetaData.createdFullName,
          previous_value_updated_on:
            previousUserMetaData.userUpdatedAt || previousUserMetaData.userCreatedAt,
          current_value_updated_user_id: consumeUserId,
          current_value_updated_by: consumeUserFullName,
          current_value_updated_on:
            previousUserMetaData.userUpdatedAt || previousUserMetaData.userCreatedAt,
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
        ],
      };
      EventLogCustomEmitter.emit("add-event", addEventData);

      return res.sendSucessResponse(
        statusCodes.OK,
        MESSAGE_ENUM.USER_DATA_UPDATED_SUCCESSFULLY,
        response
      );
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async companyUserStatus(req: any, res: any) {
    try {
      // access this api: superadmin and admin
      // change user status of superadmin, admin and team member

      // status should be 1 or 2
      const {
        userAgent,
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { status },
        params: { userId, companyId },
      } = req;

      const companyData: companyDataModel = await super.validateCompanyId(companyId);

      const condition = { id: userId };
      log.info([condition, "patchUserStatus"]);
      const userFind: any = await userRepo.searchUser(condition);

      super.validateCurrentRoleAuthorize(consumeUserRole, userFind.role);

      await super.validateIsCompayUserAssignToCompany(userId, companyId);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      let updateUserCondition: { status: number } = { status };
      delete userFind.id;

      if (userFind.status !== status) {
        await userRepo.updateUser(userId, updateUserCondition);

        // event log
        let eventLogInt = 10001;
        let eventTypeLog = "10001";
        let eventTypeLabel = "1001";

        switch (status) {
          case ENUM_User_Status.ACTIVE:
            eventLogInt = ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_ACTIVATED.id;
            eventTypeLabel = ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_ACTIVATED.eventTypeName;
            eventTypeLog = CUSTOMER_EVENT_MESSAGE.USER_ACTIVE;

            break;
          case ENUM_User_Status.INACTIVE:
            eventLogInt = ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_DEACTIVATED.id;
            eventTypeLabel = ENUM_EVENT_TYPE_LOGS.CUSTOMER_USER_DEACTIVATED.eventTypeName;
            eventTypeLog = CUSTOMER_EVENT_MESSAGE.USER_DEACTIVE;

            break;
        }

        const fullName = consumeUserFullName;
        const addEventData: companyAddLogEventInterface = {
          alterRecordUserId: userId,
          companyId,
          companyName: companyData.companyName,
          userId: consumeUserId,
          userRoleId: consumeUserRole,
          alterRecordUserRoleId: ENUM_User_ROLE.CUSTOMER_USER,
          userName: fullName,
          eventTypeId: eventLogInt,
          eventTypeLabel,
          userAgent,
          eventMessage: eventTypeLog
            .replace("%loginUserName%", fullName)
            .replace("%user2%", userFind.fullName),
        };
        EventLogCustomEmitter.emit("add-event", addEventData);

        return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.STATUS_CHANGED_SUCCESSFULLY);
      } else {
        return res.sendErrorResponse(
          statusCodes.UNPROCESSABLE_ENTITY,
          MESSAGE_ENUM.STATUS_ALREADY_SAME
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

  async pathCompanyUserSetTemporaryPassword(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { setTemporaryPassword },
        params: { userId, companyId },
        userAgent,
      } = req;

      await super.validateIsCompayUserAssignToCompany(userId, companyId);

      const companyData: companyDataModel = await super.validateCompanyId(companyId);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      const websiteLink: string = <string>config.web.LINK;
      const condition = { id: userId };
      log.info([condition, "patchSetPassword"]);
      const userFind: any = await userRepo.searchUser(condition);

      super.validateCurrentRoleAuthorize(consumeUserRole, userFind.role);

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

        const addEventData: companyAddLogEventInterface = {
          alterRecordUserId: userId,
          userId: consumeUserId,
          userRoleId: consumeUserRole,
          alterRecordUserRoleId: userFind.role,
          userName: consumeUserFullName,
          eventTypeId: eventLogInt,
          eventTypeLabel,
          userAgent,
          companyId: companyId,
          companyName: companyData.companyName,
          eventMessage: CUSTOMER_EVENT_MESSAGE.RESET_PASSWORD_OTHER.replace(
            "%loginUserName%",
            consumeUserFullName
          ).replace("%user2%", userFind.fullName),
        };
        EventLogCustomEmitter.emit("add-event", addEventData);

        return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.SET_TEMPORARY_PASSWORD);
      } else {
        return res.sendErrorResponse(
          statusCodes.SERVICE_UNAVAILABLE,
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

  async onSiteSystemData(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        body: { link },
        params: { companyId },
      } = req;

      const companyData: companyDataModel = await super.validateCompanyId(companyId);
      super.validateCurrentRoleAuthorize(consumeUserRole, companyData.userRole);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      let updateUserCondition: { onSiteSystemData: string } = { onSiteSystemData: link };

      await customerRepo.updateOnSiteSystemData(companyId, updateUserCondition, consumeUserId);

      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.LINK_UPDATED_SUCCESSFULLY);
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async addDocument(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { documentKeyName, documentType, documentName, documentFormat, documentsizeInByte },
        params: { companyId },
        userAgent,
      } = req;

      const companyData: companyDataModel = await super.validateCompanyId(companyId);
      super.validateCurrentRoleAuthorize(consumeUserRole, companyData.userRole);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      // const companyStatus: number = await customerRepo.getCompanyStatus(companyId);

      if (companyData.userStatus === ENUM_User_Status.INACTIVE) {
        return res.sendErrorResponse(
          statusCodes.FORBIDDEN,
          MESSAGE_ENUM.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT
        );
      }

      const findPrefixKeyName = companyData.preS3KeyName + "/" + ENUM_PREFIX_FILE_PATH.DOC + "/";

      const isFind = documentKeyName.includes(findPrefixKeyName);
      if (!isFind) {
        return res.sendErrorResponse(
          statusCodes.UNPROCESSABLE_ENTITY,
          MESSAGE_ENUM.DOCUMENTKEYNAME_INVALID
        );
      }
      let documentKeyName_ = documentKeyName.replace(findPrefixKeyName, "");

      const addDocumentData = {
        documentKeyName: documentKeyName_,
        documentType,
        documentName,
        documentFormat,
        documentsizeInByte,
      };

      let documentId: number;
      try {
        documentId = <number>(
          await customerRepo.createDocument(companyId, addDocumentData, consumeUserId)
        );
      } catch (error: any) {
        let message = error.sqlMgs;
        if (error.errNo === 1062) {
          if (message.includes("documents.documents_documentname_unique")) {
            message = MESSAGE_ENUM.DOCUMENT_NAME_ALREADY_EXIST;
          }
        }
        return res.sendErrorResponse(statusCodes.CONFLICT, message, {
          error: error.sqlMgs,
          error1: error,
        });
      }

      // event log
      const eventLogInt = ENUM_EVENT_TYPE_LOGS.DOCUMENT_UPLOADED.id;
      const eventTypeLabel = ENUM_EVENT_TYPE_LOGS.DOCUMENT_UPLOADED.eventTypeName;

      const fullName = consumeUserFullName;
      const addEventData: documentAddLogEventInterface = {
        alterRecordUserId: companyData.userId,
        companyId,
        companyName: companyData.companyName,
        documentId,
        documentName: documentName,
        userId: consumeUserId,
        userRoleId: consumeUserRole,
        alterRecordUserRoleId: companyData.userRole,
        userName: fullName,
        eventTypeId: eventLogInt,
        eventTypeLabel,
        userAgent,
        eventMessage: CUSTOMER_EVENT_MESSAGE.DOCUMENT_UPLOADED.replace(
          "%loginUserName%",
          fullName
        ).replace("%documentName%", documentName),
      };
      EventLogCustomEmitter.emit("add-event", addEventData);

      return res.sendSucessResponse(statusCodes.CREATED, MESSAGE_ENUM.DOCUMENT_CREATED, {
        id: documentId,
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

  async updateDocument(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: { documentType, documentName },
        params: { companyId, documentId },
        userAgent,
      } = req;

      const documentAndCompanyData: isDocumentAssignToCompanyModal =
        await super.validateDocumentAndCompanyId(documentId, companyId);
      // US 7.9
      if (documentAndCompanyData.companyStatus === ENUM_User_Status.INACTIVE) {
        throw new ForbiddenError(MESSAGE_ENUM.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
      }

      //US 13.2
      await super.validateDocumentAsEditorPermission(consumeUserRole, documentAndCompanyData);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      const documentMetaData: documentMetaDataInterface = await documentsRepo.documentMetaData(
        documentId
      );
      const documentTypeDetail: { documentTypeName: string } = <{ documentTypeName: string }>(
        await documentTypeRepo.getDocumentTypeDetail(documentType)
      );

      const updateDocumentData = {
        documentType,
        documentName,
      };

      try {
        await customerRepo.updateDocument(documentId, updateDocumentData, consumeUserId);
      } catch (error: any) {
        let message = error.sqlMgs;
        if (error.errNo === 1062) {
          if (message.includes("documents.documents_documentname_unique")) {
            message = "Document Name already exist.";
          }
        }
        return res.status(statusCodes.CONFLICT).send({
          status_code: statusCodes.CONFLICT,
          message: message,
          error: error.sqlMgs,
          error1: error,
        });
      }
      const updatedDocumentMetaData: documentMetaDataInterface =
        await documentsRepo.documentMetaData(documentId);

      // event log
      const eventLogInt = ENUM_EVENT_TYPE_LOGS.DOCUMENT_INFO_UPDATED.id;
      const eventTypeLabel = ENUM_EVENT_TYPE_LOGS.DOCUMENT_INFO_UPDATED.eventTypeName;

      const fullName = consumeUserFullName;
      const addEventData: documentAddLogEventInterface = <documentAddLogEventInterface>{
        alterRecordUserId: documentAndCompanyData.userId,

        companyId,
        companyName: documentAndCompanyData.companyName,
        documentId,
        documentName: documentName,
        userId: consumeUserId,
        userRoleId: consumeUserRole,
        alterRecordUserRoleId: documentAndCompanyData.userRole,
        userName: fullName,
        eventTypeId: eventLogInt,
        eventTypeLabel,
        userAgent,
        eventMessage: CUSTOMER_EVENT_MESSAGE.DOCUMENT_INFO_UPDATED.replace(
          "%loginUserName%",
          fullName
        ).replace("%documentName%", documentName),
      };

      addEventData.changes = {
        meta: {
          label: "Doc Info",
          documentId: documentId,
          companyId: companyId,
          previous_value_updated_user_id:
            documentMetaData.updatedUserId || documentMetaData.createdUserId,
          previous_value_updated_by:
            documentMetaData.updatedFullName || documentMetaData.createdFullName,
          previous_value_updated_on:
            documentMetaData.documentUpdatedAt || documentMetaData.documentCreatedAt,
          current_value_updated_user_id:
            updatedDocumentMetaData.updatedUserId || updatedDocumentMetaData.createdUserId,
          current_value_updated_by:
            updatedDocumentMetaData.updatedFullName || updatedDocumentMetaData.createdFullName,
          current_value_updated_on:
            updatedDocumentMetaData.documentUpdatedAt || updatedDocumentMetaData.documentCreatedAt,
        },
        event_changes: [
          {
            label: "File Name",
            previous_value: documentAndCompanyData.documentName,
            current_value: updateDocumentData.documentName,
          },
          {
            label: "File Type",
            previous_value: documentAndCompanyData.documentTypeName,
            current_value: documentTypeDetail.documentTypeName,
          },
        ],
      };

      EventLogCustomEmitter.emit("add-event", addEventData);

      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.DOCUMENT_UPDATED_SUCCESSFULLY);
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async deleteDocument(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        params: { companyId, documentId },
      } = req;

      const documentAndCompanyData = await super.validateDocumentAndCompanyId(
        documentId,
        companyId
      );
      // US 7.9
      if (documentAndCompanyData.companyStatus === ENUM_User_Status.INACTIVE) {
        throw new ForbiddenError(MESSAGE_ENUM.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
      }
      //US 13.2
      await super.validateDocumentAsEditorPermission(consumeUserRole, documentAndCompanyData);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      try {
        await customerRepo.deleteDocument(documentId, consumeUserId);
      } catch (error: any) {
        let message = error.sqlMgs;
        return res.status(statusCodes.CONFLICT).send({
          status_code: statusCodes.CONFLICT,
          message: message,
          error: error.sqlMgs,
          error1: error,
        });
      }

      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.DOCUMENT_DELETED_SUCCESSFULLY);
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async updateDocumentPermission(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole, fullName: consumeUserFullName },
        body: {
          permissionSuperAdmin,
          permissionAdmin,
          permissionTeamMember,
          permissionCustomerUser,
        },
        params: { companyId, documentId },
        userAgent,
      } = req;

      const documentAndCompanyData = await super.validateDocumentAndCompanyId(
        documentId,
        companyId
      );
      // US 7.9
      if (documentAndCompanyData.companyStatus === ENUM_User_Status.INACTIVE) {
        throw new ForbiddenError(MESSAGE_ENUM.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
      }

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      // mentioned in type>index.ts
      // removed: got error while run seed command.

      type partialupdateDocPermission = Partial<{
        permissionSuperAdmin: number;
        permissionAdmin: number;
        permissionTeamMember: number;
        permissionCustomerUser: number;
      }>;

      let updateDocPermission: partialupdateDocPermission = {
        permissionSuperAdmin,
        permissionAdmin,
        permissionTeamMember,
        permissionCustomerUser,
      };

      switch (consumeUserRole) {
        case ENUM_User_ROLE.SUPERADMIN:
          updateDocPermission = {
            // permissionSuperAdmin:2,  // can you change, you always have write permission US 17.3
            permissionAdmin,
            permissionTeamMember,
            permissionCustomerUser,
          };
          break;
        case ENUM_User_ROLE.ADMIN:
          updateDocPermission = {
            // permissionAdmin:2,  // can you change, you always have write permission US 17.5
            permissionTeamMember,
            permissionCustomerUser,
          };
          break;
        case ENUM_User_ROLE.TEAM_MEMBER:
          updateDocPermission = {
            // permissionTeamMember:2,  // can you change, you always have write permission US 17.7
            permissionCustomerUser,
          };
          break;
      }

      const previousDocumentMetaData: documentMetaDataInterface =
        await documentsRepo.documentMetaData(documentId);
      try {
        await customerRepo.updateDocPermission(documentId, updateDocPermission, consumeUserId);
      } catch (error: any) {
        let message = error.sqlMgs;
        if (error.errNo === 1062) {
          if (message.includes("documents.documents_documentname_unique")) {
            message = MESSAGE_ENUM.DOCUMENT_NAME_ALREADY_EXIST;
          }
        }
        return res.status(statusCodes.CONFLICT).send({
          status_code: statusCodes.CONFLICT,
          message: message,
          error: error.sqlMgs,
          error1: error,
        });
      }
      const currentDocumentMetaData: documentMetaDataInterface =
        await documentsRepo.documentMetaData(documentId);

      // event log
      const eventLogInt = ENUM_EVENT_TYPE_LOGS.DOCUMENT_PERMISSION_UPDATED.id;
      const eventTypeLabel = ENUM_EVENT_TYPE_LOGS.DOCUMENT_PERMISSION_UPDATED.eventTypeName;

      const fullName = consumeUserFullName;
      const addEventData: documentAddLogEventInterface = {
        alterRecordUserId: documentAndCompanyData.userId,
        documentId,
        companyId,
        companyName: documentAndCompanyData.companyName,
        documentName: documentAndCompanyData.documentName,
        userId: consumeUserId,
        userRoleId: consumeUserRole,
        alterRecordUserRoleId: documentAndCompanyData.userRole,
        userName: fullName,
        eventTypeId: eventLogInt,
        eventTypeLabel,
        userAgent,
        eventMessage: CUSTOMER_EVENT_MESSAGE.DOCUMENT_PERMISSION_UPDATED.replace(
          "%loginUserName%",
          fullName
        ).replace("%documentName%", documentAndCompanyData.documentName),
      };
      addEventData.changes = {
        meta: {
          label: "Role Permissions",
          documentId: documentId,
          companyId: companyId,
          previous_value_updated_user_id:
            previousDocumentMetaData.updatedUserId || previousDocumentMetaData.createdUserId,
          previous_value_updated_by:
            previousDocumentMetaData.updatedFullName || previousDocumentMetaData.createdFullName,
          previous_value_updated_on:
            previousDocumentMetaData.documentUpdatedAt ||
            previousDocumentMetaData.documentCreatedAt,
          current_value_updated_user_id:
            currentDocumentMetaData.updatedUserId || currentDocumentMetaData.createdUserId,
          current_value_updated_by:
            currentDocumentMetaData.updatedFullName || currentDocumentMetaData.createdFullName,
          current_value_updated_on:
            currentDocumentMetaData.documentUpdatedAt || currentDocumentMetaData.documentCreatedAt,
        },

        event_changes: [
          {
            label: "All Super Admins",
            previous_value: ENUM_PERMISSION[documentAndCompanyData.permissionSuperAdmin],
            current_value: ENUM_PERMISSION[currentDocumentMetaData.permissionSuperAdmin],
          },
          {
            label: "All Admins",
            previous_value: ENUM_PERMISSION[documentAndCompanyData.permissionAdmin],
            current_value: ENUM_PERMISSION[currentDocumentMetaData.permissionAdmin],
          },
          {
            label: "All Assigned Team Members",
            previous_value: ENUM_PERMISSION[documentAndCompanyData.permissionTeamMember],
            current_value: ENUM_PERMISSION[currentDocumentMetaData.permissionTeamMember],
          },
          {
            label: "All Customer Users",
            previous_value: ENUM_PERMISSION[documentAndCompanyData.permissionCustomerUser],
            current_value: ENUM_PERMISSION[currentDocumentMetaData.permissionCustomerUser],
          },
        ],
      };
      EventLogCustomEmitter.emit("add-event", addEventData);

      return res.sendSucessResponse(
        statusCodes.OK,
        MESSAGE_ENUM.DOCUMENT_PERMISSION_UPDATED_SUCCESSFULLY,
        { updateDocPermission: updateDocPermission }
      );
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async getCustomersForMoveDocument(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        query: { filter },
        params: { companyId, documentId },
      } = req;

      super.validateCurrentRoleAuthorize(consumeUserRole, ENUM_User_ROLE.CUSTOMER_USER);
      const documentAndCompanyData: isDocumentAssignToCompanyModal =
        await super.validateDocumentAndCompanyId(documentId, companyId);
      // US 7.9
      if (documentAndCompanyData.companyStatus === ENUM_User_Status.INACTIVE) {
        throw new ForbiddenError(MESSAGE_ENUM.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
      }

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      const recordPerPage = 100;
      const offset = 0;

      const sortObject: any = { column: "c.companyName", order: "asc" };
      const pageLimitObj = { limit: recordPerPage, offset: offset };

      const sqlQuery = [];
      const sqlQueryParams = [];

      sqlQuery.push(` u.status IN (?,?)`);
      sqlQueryParams.push(ENUM_User_Status.ACTIVE);
      sqlQueryParams.push(ENUM_User_Status.PENDING);

      sqlQuery.push(` cu.isCompanyOwner = ?`);
      sqlQueryParams.push(true);

      sqlQuery.push(` c.id != ?`);
      sqlQueryParams.push(companyId);

      if (consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER) {
        const teamMemberData: any = await customerRepo.getCompanyListFromTeammember(consumeUserId);

        const tmIds: number[] = [];
        const tmComma: string[] = [];

        if (teamMemberData && teamMemberData.length) {
          teamMemberData.map((rec: any) => {
            tmComma.push("?");
            tmIds.push(rec.companyId);
          });
        } else {
          tmComma.push("?");
          tmIds.push(-1);
        }

        if (tmIds && tmIds.length) {
          sqlQuery.push(` c.id IN (${tmComma.join()})`);
          sqlQueryParams.push(...tmIds);
        }
      }

      if (filter) {
        if (filter.nameOrUniqueId) {
          sqlQuery.push(`( c.companyName like ? or  c.uniqueId like ? )`);
          sqlQueryParams.push(`%${filter.nameOrUniqueId}%`);
          sqlQueryParams.push(`%${filter.nameOrUniqueId}%`);
        }
      }

      let sqlQueryBuilder = sqlQuery.join(" and ");
      let sqlQueryBuilderList = sqlQueryParams;

      let userList = await customerRepo.getCompanyNameList(sqlQueryBuilder, sqlQueryBuilderList, {
        sortObject,
        pageLimit: pageLimitObj,
      });

      const data = {
        records: userList,
      };

      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.LIST, data);
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async moveDocumentToTargetCompany(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        params: { companyId, documentId, targetCompanyId },
      } = req;

      const oldCompanyData: companyDataModel = await super.validateCompanyId(companyId);
      const targetCompanyData: companyDataModel = await super.validateCompanyId(targetCompanyId);

      if (
        oldCompanyData.userStatus === ENUM_User_Status.INACTIVE ||
        targetCompanyData.userStatus === ENUM_User_Status.INACTIVE
      ) {
        return res.status(statusCodes.FORBIDDEN).send({
          status_code: statusCodes.FORBIDDEN,
          message: MESSAGE_ENUM.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT,
        });
      }

      const documentAndCompanyData = await super.validateDocumentAndCompanyId(
        documentId,
        companyId
      );
      // US 7.9
      if (documentAndCompanyData.companyStatus === ENUM_User_Status.INACTIVE) {
        throw new ForbiddenError(MESSAGE_ENUM.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT);
      }
      //US 13.2
      await super.validateDocumentAsEditorPermission(consumeUserRole, documentAndCompanyData);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      try {
        const copyFile =
          oldCompanyData.preS3KeyName +
          "/" +
          ENUM_PREFIX_FILE_PATH.DOC +
          "/" +
          documentAndCompanyData.documentKeyName;
        const targetFile =
          targetCompanyData.preS3KeyName +
          "/" +
          ENUM_PREFIX_FILE_PATH.DOC +
          "/" +
          documentAndCompanyData.documentKeyName;

        log.error(["copyFile", copyFile]);
        log.error(["targetFile", targetFile]);

        let moveDocumentToTargeCompanyId = await documentsRepo.moveDocumentToTargeCompanyId(
          documentId,
          targetCompanyId,
          copyFile,
          targetFile,
          consumeUserId
        );

        const data = {
          targetCompanyId: targetCompanyId,
        };
        return res.sendSucessResponse(
          statusCodes.OK,
          MESSAGE_ENUM.DOCUMENT_MOVE_SUCCESSFULLY,
          data
        );
      } catch (Error: any) {
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).send({
          status_code: statusCodes.INTERNAL_SERVER_ERROR,
          message: Error.message,
          errors: Error.message,
        });
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

  async fetchCustomer(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        params: {},
        query: { filter },
      } = req;

      const sqlQuery = [];
      const sqlQueryParams = [];

      if (filter) {
        if (filter.companyName) {
          sqlQuery.push("c.companyName like ?");
          sqlQueryParams.push(`%${filter.companyName}%`);
        }
      }

      if (consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER) {
        const teamMemberData: any = await customerRepo.getCompanyListFromTeammember(consumeUserId);

        const tmIds: number[] = [];
        const tmComma: string[] = [];

        if (teamMemberData && teamMemberData.length) {
          teamMemberData.map((rec: any) => {
            tmComma.push("?");
            tmIds.push(rec.companyId);
          });
        } else {
          tmComma.push("?");
          tmIds.push(-1);
        }

        if (tmIds && tmIds.length) {
          sqlQuery.push(` c.id IN (${tmComma.join()})`);
          sqlQueryParams.push(...tmIds);
        }
      }

      const sortObject: any = { column: "c.companyName", order: "asc" };
      const pageLimitObj = { limit: 100, offset: 0 };

      let sqlQueryBuilder = sqlQuery.join(" and ");
      let sqlQueryBuilderList = sqlQueryParams;

      let userList = await customerRepo.getCustomerFetchList(sqlQueryBuilder, sqlQueryBuilderList, {
        sortObject,
        pageLimit: pageLimitObj,
      });

      const data = {
        records: userList,
      };

      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.LIST, data);
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async createPresignedPost(req: any, res: any) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        query: { fileExt },
        params: { companyId },
      } = req;

      let preS3KeyName;

      const milliseconds = new Date().getTime();
      const fileName = "doc-" + milliseconds + "." + fileExt;
      const companyData: companyDataModel = await super.validateCompanyId(companyId);

      preS3KeyName = companyData.preS3KeyName;
      super.validateCurrentRoleAuthorize(consumeUserRole, companyData.userRole);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      const keyName = `${preS3KeyName}/${ENUM_PREFIX_FILE_PATH.DOC}/${fileName}`;

      const presignedPostObj = await _createPresignedPost({
        Bucket: config.S3.AWS_BUCKET_NAME,
        Fields: {
          key: keyName,
        },
        Expires: config.S3.S3_CREATE_PRESIGNED_POST_SECOND,
        // 'ContentType': 'image/png',
      });

      return res.sendSucessResponse(
        statusCodes.OK,
        MESSAGE_ENUM.CREATE_PESIGNED_LINK,
        presignedPostObj
      );
    } catch (Error: any) {
      log.error(["additionalInformation", Error]);
      return res.sendErrorResponse(
        Error.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
        Error.message || MESSAGE_ENUM.SOMETHING_WENT_WRONG,
        { errors: Error.message }
      );
    }
  }

  async createCloudFrontPresigned(req: any, res: any, next: NextFunction) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        params: { companyId, documentId },
        query: { action },
      } = req;

      const companyData: companyDataModel = await super.validateCompanyId(companyId);

      await super.validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId);

      const documentAndCompanyData = await super.validateDocumentAndCompanyId(
        documentId,
        companyId
      );

      if (action === "download") {
        //US 13.2
        await super.validateDocumentAsEditorPermission(consumeUserRole, documentAndCompanyData);
      }

      if (consumeUserRole === ENUM_User_ROLE.CUSTOMER_USER) {
        await super.validateIsCompayUserAssignToCompany(consumeUserId, companyId);
      }

      const fileName =
        companyData.preS3KeyName +
        "/" +
        ENUM_PREFIX_FILE_PATH.DOC +
        "/" +
        documentAndCompanyData.documentKeyName;

      const presignedPostObj = await _createCloudFrontPresigned(fileName);

      return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.CREATE_PESIGNED_LINK, {
        url: presignedPostObj,
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

  async multipleDownload(req: any, res: any, next: NextFunction) {
    try {
      const {
        user: { id: consumeUserId, role: consumeUserRole },
        body: { documentIds },
        query: { companyId },
      } = req;

      const keysNameList = [];
      const viewKeysNameList = [];

      const _getMultipleDocumentsList: getMultipleDocumentsModal[] =
        await customerRepo.getMultipleDocuments(documentIds);

      for (let rec of _getMultipleDocumentsList) {
        if (
          (consumeUserRole === ENUM_User_ROLE.SUPERADMIN &&
            rec.permissionSuperAdmin === ENUM_PERMISSION.EDITOR) ||
          (consumeUserRole === ENUM_User_ROLE.ADMIN &&
            rec.permissionAdmin === ENUM_PERMISSION.EDITOR) ||
          (consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER &&
            rec.permissionTeamMember === ENUM_PERMISSION.EDITOR) ||
          (consumeUserRole === ENUM_User_ROLE.CUSTOMER_USER &&
            rec.permissionCustomerUser === ENUM_PERMISSION.EDITOR)
        ) {
          const fileName =
            rec.preS3KeyName + "/" + ENUM_PREFIX_FILE_PATH.DOC + "/" + rec.documentKeyName;
          const extension = rec.documentKeyName.split(".").pop();
          const newFileName = rec.documentName + "." + extension;
          keysNameList.push({ key: fileName, newKeyName: newFileName });
        } else {
          viewKeysNameList.push(rec.documentName);
        }
      }

      if (viewKeysNameList && viewKeysNameList.length) {
        return res.sendErrorResponse(
          statusCodes.UNPROCESSABLE_ENTITY,
          "These files are in view mode " + viewKeysNameList.join()
        );
      }

      const companyIds = _getMultipleDocumentsList.map((rec) => {
        return rec.companyId;
      });

      let companyUniquesIds = [...new Set(companyIds)];

      const companyDatas = await super.validateMultipleCompanyIds(companyUniquesIds);

      for (let companyRec of companyDatas) {
        if (
          consumeUserRole === ENUM_User_ROLE.CUSTOMER_USER &&
          companyRec.userStatus === ENUM_User_Status.INACTIVE
        ) {
          return res.sendErrorResponse(
            statusCodes.FORBIDDEN,
            MESSAGE_ENUM.CUSTOMER_DEACTIVATE_ADD_MODIFY_DOCUMENT
          );
        }
      }

      await super.validateIsTeamMemberAssignToMultipleCompany(
        consumeUserRole,
        consumeUserId,
        companyUniquesIds
      );

      if (consumeUserRole === ENUM_User_ROLE.CUSTOMER_USER) {
        await super.isCompayUserAssignToMultipleCompany(consumeUserId, companyUniquesIds);
      }

      if (keysNameList && keysNameList.length) {
        const lambdaResponse: any = await _multipleDownload(keysNameList);
        const createdS3: { zipFileName: string; awsRequestId: string } = JSON.parse(
          lambdaResponse.Payload
        );
        const presignedPostObj = await _createCloudFrontPresigned(createdS3.zipFileName);
        return res.sendSucessResponse(statusCodes.OK, MESSAGE_ENUM.DOWNLOAD_MULTIPLE_LINK, {
          // url: createdS3,
          downloadLink: presignedPostObj,
        });
      } else {
        return res.sendErrorResponse(statusCodes.UNPROCESSABLE_ENTITY, "Nothing to download");
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

export default new CustomerController();
