export interface getCompanyUserDataFromUserIdModel {
  companyId: string;
  isCompanyOwner: string;
}

export interface companyDataModel {
  companyId: number;
  companyName: string;
  onSiteSystemData: string;
  userId: number;
  userStatus: number;
  userRole: number;
  preS3KeyName: string;
}

export interface isDocumentAssignToCompanyModal {
  userId: number;
  userRole: number;
  companyStatus: number;
  documentId: number;
  companyId: number;
  companyName: string;
  documentFormat: string;
  documentsizeInByte: string;
  permissionSuperAdmin: number;
  permissionAdmin: number;
  permissionTeamMember: number;
  permissionCustomerUser: number;
  documentName: string;
  documentType: number;
  documentStatus: number;
  documentKeyName: string;
  documentTypeName: string;
}

export interface getMultipleDocumentsModal {
  documentId: number;
  companyId: number;
  permissionSuperAdmin: number;
  permissionAdmin: number;
  permissionTeamMember: number;
  permissionCustomerUser: number;
  documentKeyName: string;
  preS3KeyName: string;
  documentName: string;
}

export interface companyMetaDataInterface {
  createdUserId: number;
  createdFullName: string;
  updatedUserId: number;
  updatedFullName: string;
  companyCreatedAt: string;
  companyUpdatedAt: string;
  companyRegionName: string;
  companyName: string;
  companyAddress: string;
  uniqueId: string;
  firstName: string;
  lastName: string;
  email: string;
}
