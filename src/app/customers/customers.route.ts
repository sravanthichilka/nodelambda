import express from "express";
import auth from "./customers.controller";
import schema from "./customers.validator";
import { createValidator } from "express-joi-validation";
import isAccessTokenValidMiddleware from "../../middleware/multipleAccessMiddleware";
import { ENUM_User_ROLE } from "../../helper/constants";

const a = express.Router();
const validator = createValidator({
  passError: true,
});

//sprint 3
a.get(
  "/fetch",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.query(schema.fetch),
  auth.fetchCustomer
);
a.get(
  "/",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.query(schema.companyList),
  auth.getCustomers
);
a.post(
  "/",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.body(schema.addCustomer),
  auth.addCustomer
);
a.put(
  "/:companyId",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.body(schema.putCustomer),
  auth.putCustomer
);
a.get(
  "/:companyId",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
    ENUM_User_ROLE.CUSTOMER_USER,
  ]),
  validator.params(schema.paramsCompanyId),
  auth.getCompanyDetail
);
a.patch(
  "/:companyId/status",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.params(schema.paramsCompanyId),
  validator.body(schema.patchCustomerStatus),
  auth.patchCustomerStatus
);

//sprint 4
a.post(
  "/:companyId/users",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.body(schema.addCompanyUser),
  auth.addCompanyUser
);
a.get(
  "/:companyId/users",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.query(schema.companyUserList),
  auth.companyUserList
);
a.put(
  "/:companyId/users/:userId",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.body(schema.companyUserUpdate),
  auth.companyUserUpdate
);
a.patch(
  "/:companyId/users/:userId/status",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.body(schema.companyUserStatus),
  auth.companyUserStatus
);
a.patch(
  "/:companyId/users/:userId/setTemporaryPassword",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.body(schema.companyUserSetPassword),
  auth.pathCompanyUserSetTemporaryPassword
);

a.patch(
  "/:companyId/onSiteSystemData",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.body(schema.onSiteSystemData),
  auth.onSiteSystemData
);

a.post(
  "/:companyId/documents",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.body(schema.addDocument),
  auth.addDocument
);
a.put(
  "/:companyId/documents/:documentId",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.body(schema.updateDocument),
  auth.updateDocument
);
a.delete(
  "/:companyId/documents/:documentId",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  auth.deleteDocument
);
a.patch(
  "/:companyId/documents/:documentId/permission",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.body(schema.updateDocumentPermission),
  auth.updateDocumentPermission
);
a.get(
  "/:companyId/documents/:documentId/getCustomersForMoveDocument",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.query(schema.getCustomersForMoveDocument),
  auth.getCustomersForMoveDocument
);
a.patch(
  "/:companyId/documents/:documentId/moveToCompany/:targetCompanyId",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  auth.moveDocumentToTargetCompany
);

a.get(
  "/:companyId/documents/getPesigrnedUploadURL",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
  ]),
  validator.params(schema.paramsCompanyId),
  validator.query(schema.queryGetPesignedUploadURL),
  auth.createPresignedPost
);
a.get(
  "/:companyId/documents/:documentId/getPesigrnedDownloadURL",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
    ENUM_User_ROLE.CUSTOMER_USER,
  ]),
  validator.params(schema.paramsGetPesignedUploadURL),
  auth.createCloudFrontPresigned
);
a.get(
  "/:companyId/documents/:documentId/getPesigrnedDownloadOrViewURL",
  isAccessTokenValidMiddleware([
    ENUM_User_ROLE.SUPERADMIN,
    ENUM_User_ROLE.ADMIN,
    ENUM_User_ROLE.TEAM_MEMBER,
    ENUM_User_ROLE.CUSTOMER_USER,
  ]),
  validator.params(schema.paramsGetPesignedUploadURL),
  validator.query(schema.getPesigrnedDownloadOrViewURL),
  auth.createCloudFrontPresigned
);

// a.post(
//   "/downloadMultipleFiles",
//   isAccessTokenValidMiddleware([
//     ENUM_User_ROLE.SUPERADMIN,
//     ENUM_User_ROLE.ADMIN,
//     ENUM_User_ROLE.TEAM_MEMBER,
//     ENUM_User_ROLE.CUSTOMER_USER,
//   ]),
//   validator.body(schema.downloadMultipleFiles),
//   auth.multipleDownload
// );

export = a;
