"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../helper/constants");
const forbiddenError_1 = __importDefault(require("../helper/error/forbiddenError"));
const message_1 = __importDefault(require("../helper/message"));
const customers_repo_1 = __importDefault(require("./customers/customers.repo"));
const unProcessableError_1 = __importDefault(require("../helper/error/unProcessableError"));
/**
 *
  If will compare with compareRole. currentRole<compareRole

  example:
     2-3
 * @param currentRole
 * @param compareRole
 * @returns
 */
const isCurrentRoleAuthorize = (currentRole, compareRole) => {
    if (currentRole === constants_1.ENUM_User_ROLE.SUPERADMIN) {
        return true;
    }
    if (currentRole < compareRole) {
        return true;
    }
    else {
        return false;
    }
};
class Controller {
    validateUserStatusDeactive(userStatus) {
        if (userStatus === constants_1.ENUM_User_Status.INACTIVE) {
            throw new forbiddenError_1.default(message_1.default.ACCOUNT_DEACTIVE);
        }
    }
    validateCurrentRoleAuthorize(currentRole, compareRole) {
        const isAuthorizeByRole = isCurrentRoleAuthorize(currentRole, compareRole);
        if (!isAuthorizeByRole) {
            throw new forbiddenError_1.default(message_1.default.NOT_AUTHORIZED_TO_UPDATE_ON_USER);
        }
    }
    validateCompanyId(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyData = yield customers_repo_1.default.companyData(companyId);
            return companyData;
        });
    }
    validateMultipleCompanyIds(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyData = yield customers_repo_1.default.companyMultipleData(companyId);
            if (companyData && companyData.length == 0) {
                throw new unProcessableError_1.default(message_1.default.COMPANY_NOT_FOUND);
            }
            return companyData;
        });
    }
    validateIsTeamMemberAssignToCompany(consumeUserRole, consumeUserId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                const isLinkWithCompany = yield customers_repo_1.default.isTeamMemberAssignToCompany(consumeUserId, companyId);
                if (!isLinkWithCompany) {
                    throw new forbiddenError_1.default(message_1.default.TEAM_MEMBER_IS_NOT_ASSIGN_TO_COMPNAY);
                }
            }
        });
    }
    validateIsTeamMemberAssignToMultipleCompany(consumeUserRole, consumeUserId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER) {
                const isLinkWithCompany = yield customers_repo_1.default.isTeamMemberAssignToMultipleCompany(consumeUserId, companyId);
                if (isLinkWithCompany != companyId.length) {
                    throw new forbiddenError_1.default(message_1.default.TEAM_MEMBER_IS_NOT_ASSIGN_TO_COMPNAY);
                }
            }
        });
    }
    validateIsCompayUserAssignToCompany(userId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isCustomerUserLinkWithCompany = yield customers_repo_1.default.isCompayUserAssignToCompany(userId, companyId);
            if (!isCustomerUserLinkWithCompany) {
                throw new forbiddenError_1.default(message_1.default.CUSTOMER_USER_NO_ASSOCIATE_WITH_YOU);
            }
        });
    }
    isCompayUserAssignToMultipleCompany(userId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isCustomerUserLinkWithCompany = yield customers_repo_1.default.isCompayUserAssignToMultipleCompany(userId, companyId);
            if (isCustomerUserLinkWithCompany != companyId.length) {
                throw new forbiddenError_1.default(message_1.default.CUSTOMER_USER_NO_ASSOCIATE_WITH_YOU);
            }
        });
    }
    // check company exist or not
    // check document assign to company Id or not
    // check company is inactive
    validateDocumentAndCompanyId(documentId, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isDocumentAssignToCompany = yield customers_repo_1.default.isDocumentAssignToCompany(documentId, companyId);
                if (isDocumentAssignToCompany.documentStatus) {
                    throw new forbiddenError_1.default(message_1.default.DOCUMENT_DELETED_ADD_MODIFY_DOCUMENT);
                }
                return isDocumentAssignToCompany;
            }
            catch (e) {
                throw new unProcessableError_1.default(e.message);
            }
        });
    }
    validateDocumentAsEditorPermission(consumeUserRole, documentAndCompanyData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!((consumeUserRole === constants_1.ENUM_User_ROLE.SUPERADMIN &&
                documentAndCompanyData.permissionSuperAdmin === constants_1.ENUM_PERMISSION.EDITOR) ||
                (consumeUserRole === constants_1.ENUM_User_ROLE.ADMIN &&
                    documentAndCompanyData.permissionAdmin === constants_1.ENUM_PERMISSION.EDITOR) ||
                (consumeUserRole === constants_1.ENUM_User_ROLE.TEAM_MEMBER &&
                    documentAndCompanyData.permissionTeamMember === constants_1.ENUM_PERMISSION.EDITOR) ||
                (consumeUserRole === constants_1.ENUM_User_ROLE.CUSTOMER_USER &&
                    documentAndCompanyData.permissionCustomerUser === constants_1.ENUM_PERMISSION.EDITOR))) {
                throw new unProcessableError_1.default(message_1.default.DOCUMENT_ARE_IN_VIEW_MODE);
            }
        });
    }
}
exports.default = Controller;
