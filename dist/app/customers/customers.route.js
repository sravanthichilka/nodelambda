"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const customers_controller_1 = __importDefault(require("./customers.controller"));
const customers_validator_1 = __importDefault(require("./customers.validator"));
const express_joi_validation_1 = require("express-joi-validation");
const multipleAccessMiddleware_1 = __importDefault(require("../../middleware/multipleAccessMiddleware"));
const constants_1 = require("../../helper/constants");
const a = express_1.default.Router();
const validator = express_joi_validation_1.createValidator({
    passError: true,
});
//sprint 3
a.get("/fetch", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.query(customers_validator_1.default.fetch), customers_controller_1.default.fetchCustomer);
a.get("/", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.query(customers_validator_1.default.companyList), customers_controller_1.default.getCustomers);
a.post("/", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.body(customers_validator_1.default.addCustomer), customers_controller_1.default.addCustomer);
a.put("/:companyId", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.body(customers_validator_1.default.putCustomer), customers_controller_1.default.putCustomer);
a.get("/:companyId", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
    constants_1.ENUM_User_ROLE.CUSTOMER_USER,
]), validator.params(customers_validator_1.default.paramsCompanyId), customers_controller_1.default.getCompanyDetail);
a.patch("/:companyId/status", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.params(customers_validator_1.default.paramsCompanyId), validator.body(customers_validator_1.default.patchCustomerStatus), customers_controller_1.default.patchCustomerStatus);
//sprint 4
a.post("/:companyId/users", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.body(customers_validator_1.default.addCompanyUser), customers_controller_1.default.addCompanyUser);
a.get("/:companyId/users", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.query(customers_validator_1.default.companyUserList), customers_controller_1.default.companyUserList);
a.put("/:companyId/users/:userId", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.body(customers_validator_1.default.companyUserUpdate), customers_controller_1.default.companyUserUpdate);
a.patch("/:companyId/users/:userId/status", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.body(customers_validator_1.default.companyUserStatus), customers_controller_1.default.companyUserStatus);
a.patch("/:companyId/users/:userId/setTemporaryPassword", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.body(customers_validator_1.default.companyUserSetPassword), customers_controller_1.default.pathCompanyUserSetTemporaryPassword);
a.patch("/:companyId/onSiteSystemData", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.body(customers_validator_1.default.onSiteSystemData), customers_controller_1.default.onSiteSystemData);
a.post("/:companyId/documents", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.body(customers_validator_1.default.addDocument), customers_controller_1.default.addDocument);
a.put("/:companyId/documents/:documentId", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.body(customers_validator_1.default.updateDocument), customers_controller_1.default.updateDocument);
a.delete("/:companyId/documents/:documentId", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), customers_controller_1.default.deleteDocument);
a.patch("/:companyId/documents/:documentId/permission", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.body(customers_validator_1.default.updateDocumentPermission), customers_controller_1.default.updateDocumentPermission);
a.get("/:companyId/documents/:documentId/getCustomersForMoveDocument", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.query(customers_validator_1.default.getCustomersForMoveDocument), customers_controller_1.default.getCustomersForMoveDocument);
a.patch("/:companyId/documents/:documentId/moveToCompany/:targetCompanyId", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), customers_controller_1.default.moveDocumentToTargetCompany);
a.get("/:companyId/documents/getPesigrnedUploadURL", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
]), validator.params(customers_validator_1.default.paramsCompanyId), validator.query(customers_validator_1.default.queryGetPesignedUploadURL), customers_controller_1.default.createPresignedPost);
a.get("/:companyId/documents/:documentId/getPesigrnedDownloadURL", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
    constants_1.ENUM_User_ROLE.CUSTOMER_USER,
]), validator.params(customers_validator_1.default.paramsGetPesignedUploadURL), customers_controller_1.default.createCloudFrontPresigned);
a.get("/:companyId/documents/:documentId/getPesigrnedDownloadOrViewURL", multipleAccessMiddleware_1.default([
    constants_1.ENUM_User_ROLE.SUPERADMIN,
    constants_1.ENUM_User_ROLE.ADMIN,
    constants_1.ENUM_User_ROLE.TEAM_MEMBER,
    constants_1.ENUM_User_ROLE.CUSTOMER_USER,
]), validator.params(customers_validator_1.default.paramsGetPesignedUploadURL), validator.query(customers_validator_1.default.getPesigrnedDownloadOrViewURL), customers_controller_1.default.createCloudFrontPresigned);
module.exports = a;
