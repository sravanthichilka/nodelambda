export interface documentMetaDataInterface {
  documentId: number;
  documentCreatedAt: number;
  documentUpdatedAt: number;
  createdUserId: number;
  createdFullName: string;
  updatedUserId: number;
  updatedFullName: string;
  permissionSuperAdmin: number;
  permissionAdmin: number;
  permissionTeamMember: number;
  permissionCustomerUser: number;
}
