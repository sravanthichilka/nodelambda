const Joi = require("@hapi/joi");
import { ENUM_User_Status } from "../../helper/constants";
const authSchema = {
  companyList: Joi.object({
    currentPage: Joi.number().default(1),
    recordPerPage: Joi.number().default(10),
    sortBy: Joi.object({
      firstName: Joi.string().valid("asc", "desc"),
      lastName: Joi.string().valid("asc", "desc"),
      email: Joi.string().valid("asc", "desc"),
      status: Joi.string().valid("asc", "desc"),
      companyName: Joi.string().valid("asc", "desc"),
      uniqueId: Joi.string().valid("asc", "desc"),
    }),
    filter: Joi.object({
      regionId: Joi.number(),
      firstLastAndUnique: Joi.string(),
    }),
  }),

  addCustomer: Joi.object({
    customerUser: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      temporaryPassword: Joi.string().required(),
    }).required(),
    companyInfo: Joi.object({
      companyName: Joi.string().required(),
      companyAddress: Joi.string().required(),
      uniqueId: Joi.string().required(),
      regionId: Joi.number().required(),
    }).required(),
    assignedTeamMember: Joi.array().unique().default([]),
  }),

  putCustomer: Joi.object({
    customerUser: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
    }).required(),
    companyInfo: Joi.object({
      companyName: Joi.string().required(),
      companyAddress: Joi.string().required(),
      uniqueId: Joi.string().required(),
      regionId: Joi.number().required(),
    }).required(),
    assignedTeamMember: Joi.array().unique().default([]),
  }),

  patchCustomerStatus: Joi.object({
    status: Joi.number().valid(ENUM_User_Status.ACTIVE, ENUM_User_Status.INACTIVE).required(),
  }),

  addCompanyUser: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    temporaryPassword: Joi.string().required(),
  }),

  companyUserList: Joi.object({
    currentPage: Joi.number().default(1),
    recordPerPage: Joi.number().default(10),
    sortBy: Joi.object({
      firstName: Joi.string().valid("asc", "desc"),
      lastName: Joi.string().valid("asc", "desc"),
      email: Joi.string().valid("asc", "desc"),
      status: Joi.string().valid("asc", "desc"),
      role: Joi.string().valid("asc", "desc"),
    }),
    filter: Joi.object({
      firstLastAndEmail: Joi.string(),
    }),
  }),

  companyUserUpdate: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
  }),

  companyUserStatus: Joi.object({
    status: Joi.number().valid(ENUM_User_Status.ACTIVE, ENUM_User_Status.INACTIVE).required(),
  }),
  companyUserSetPassword: Joi.object({
    setTemporaryPassword: Joi.string().required(),
  }),
  onSiteSystemData: Joi.object({
    link: Joi.string().required(),
  }),

  addDocument: Joi.object({
    documentKeyName: Joi.string().required(),
    documentType: Joi.number().required(),
    documentName: Joi.string().required(),
    documentFormat: Joi.string().required(),
    documentsizeInByte: Joi.string()
      .pattern(/^[0-9]+$/)
      .required(),
  }),

  updateDocument: Joi.object({
    documentType: Joi.number().required(),
    documentName: Joi.string().required(),
  }),

  updateDocumentPermission: Joi.object({
    permissionSuperAdmin: Joi.number().required(),
    permissionAdmin: Joi.number().required(),
    permissionTeamMember: Joi.number().required(),
    permissionCustomerUser: Joi.number().required(),
  }),

  getCustomersForMoveDocument: Joi.object({
    filter: Joi.object({
      nameOrUniqueId: Joi.string(),
    }),
  }),

  paramsCompanyId: Joi.object({
    companyId: Joi.string().required(),
  }),

  paramsGetPesignedUploadURL: Joi.object({
    companyId: Joi.string().required(),
    documentId: Joi.string().required(),
  }),

  getPesigrnedDownloadOrViewURL: Joi.object({
    action: Joi.string().valid("view", "download").default("view"),
  }),

  queryGetPesignedUploadURL: Joi.object({
    fileExt: Joi.string().valid("pdf", "png", "jpeg", "jpg").required(),
  }),

  downloadMultipleFiles: Joi.object({
    documentIds: Joi.array().items(Joi.number()).min(1).required(),
  }),

  fetch: Joi.object({
    filter: Joi.object({
      companyName: Joi.string(),
    }),
  }),
};

export default authSchema;
