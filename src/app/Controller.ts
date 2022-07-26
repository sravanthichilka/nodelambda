import { ENUM_PERMISSION, ENUM_User_ROLE, ENUM_User_Status } from "../helper/constants";
import ForbiddenError from "../helper/error/forbiddenError";
import MESSAGE_ENUM from "../helper/message";
import customerRepo from "./customers/customers.repo";
import UnProcessableError from "../helper/error/unProcessableError";
import { companyDataModel, isDocumentAssignToCompanyModal } from "./customers/customer.interface";

/**
 *  
  If will compare with compareRole. currentRole<compareRole

  example:
     2-3
 * @param currentRole 
 * @param compareRole 
 * @returns 
 */
const isCurrentRoleAuthorize = (currentRole: number, compareRole: number) => {
  if (currentRole === ENUM_User_ROLE.SUPERADMIN) {
    return true;
  }

  if (currentRole < compareRole) {
    return true;
  } else {
    return false;
  }
};

class Controller {
  validateUserStatusDeactive(userStatus: number) {
    if (userStatus === ENUM_User_Status.INACTIVE) {
      throw new ForbiddenError(MESSAGE_ENUM.ACCOUNT_DEACTIVE);
    }
  }

  validateCurrentRoleAuthorize(currentRole: number, compareRole: number) {
    const isAuthorizeByRole: boolean = isCurrentRoleAuthorize(currentRole, compareRole);
    if (!isAuthorizeByRole) {
      throw new ForbiddenError(MESSAGE_ENUM.NOT_AUTHORIZED_TO_UPDATE_ON_USER);
    }
  }

  async validateCompanyId(companyId: number): Promise<companyDataModel> {
    const companyData: companyDataModel = await customerRepo.companyData(companyId);
    return companyData;
  }

  async validateMultipleCompanyIds(companyId: number[]): Promise<companyDataModel[]> {
    const companyData: companyDataModel[] = await customerRepo.companyMultipleData(companyId);
    if (companyData && companyData.length == 0) {
      throw new UnProcessableError(MESSAGE_ENUM.COMPANY_NOT_FOUND);
    }

    return companyData;
  }

  async validateIsTeamMemberAssignToCompany(
    consumeUserRole: number,
    consumeUserId: number,
    companyId: number
  ) {
    if (consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER) {
      const isLinkWithCompany = await customerRepo.isTeamMemberAssignToCompany(
        consumeUserId,
        companyId
      );
      if (!isLinkWithCompany) {
        throw new ForbiddenError(MESSAGE_ENUM.TEAM_MEMBER_IS_NOT_ASSIGN_TO_COMPNAY);
      }
    }
  }

  async validateIsTeamMemberAssignToMultipleCompany(
    consumeUserRole: number,
    consumeUserId: number,
    companyId: number[]
  ) {
    if (consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER) {
      const isLinkWithCompany = await customerRepo.isTeamMemberAssignToMultipleCompany(
        consumeUserId,
        companyId
      );

      if (isLinkWithCompany != companyId.length) {
        throw new ForbiddenError(MESSAGE_ENUM.TEAM_MEMBER_IS_NOT_ASSIGN_TO_COMPNAY);
      }
    }
  }

  async validateIsCompayUserAssignToCompany(userId: number, companyId: number) {
    const isCustomerUserLinkWithCompany = await customerRepo.isCompayUserAssignToCompany(
      userId,
      companyId
    );
    if (!isCustomerUserLinkWithCompany) {
      throw new ForbiddenError(MESSAGE_ENUM.CUSTOMER_USER_NO_ASSOCIATE_WITH_YOU);
    }
  }

  async isCompayUserAssignToMultipleCompany(userId: number, companyId: number[]) {
    const isCustomerUserLinkWithCompany = await customerRepo.isCompayUserAssignToMultipleCompany(
      userId,
      companyId
    );
    if (isCustomerUserLinkWithCompany != companyId.length) {
      throw new ForbiddenError(MESSAGE_ENUM.CUSTOMER_USER_NO_ASSOCIATE_WITH_YOU);
    }
  }

  // check company exist or not
  // check document assign to company Id or not
  // check company is inactive
  async validateDocumentAndCompanyId(
    documentId: number,
    companyId: number
  ): Promise<isDocumentAssignToCompanyModal> {
    try {
      const isDocumentAssignToCompany: isDocumentAssignToCompanyModal =
        await customerRepo.isDocumentAssignToCompany(documentId, companyId);

      if (isDocumentAssignToCompany.documentStatus) {
        throw new ForbiddenError(MESSAGE_ENUM.DOCUMENT_DELETED_ADD_MODIFY_DOCUMENT);
      }

      return isDocumentAssignToCompany;
    } catch (e: any) {
      throw new UnProcessableError(e.message);
    }
  }

  async validateDocumentAsEditorPermission(
    consumeUserRole: number,
    documentAndCompanyData: isDocumentAssignToCompanyModal
  ) {
    if (
      !(
        (consumeUserRole === ENUM_User_ROLE.SUPERADMIN &&
          documentAndCompanyData.permissionSuperAdmin === ENUM_PERMISSION.EDITOR) ||
        (consumeUserRole === ENUM_User_ROLE.ADMIN &&
          documentAndCompanyData.permissionAdmin === ENUM_PERMISSION.EDITOR) ||
        (consumeUserRole === ENUM_User_ROLE.TEAM_MEMBER &&
          documentAndCompanyData.permissionTeamMember === ENUM_PERMISSION.EDITOR) ||
        (consumeUserRole === ENUM_User_ROLE.CUSTOMER_USER &&
          documentAndCompanyData.permissionCustomerUser === ENUM_PERMISSION.EDITOR)
      )
    ) {
      throw new UnProcessableError(MESSAGE_ENUM.DOCUMENT_ARE_IN_VIEW_MODE);
    }
  }
}

export default Controller;
