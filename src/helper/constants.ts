enum ENUM_User_ROLE {
  SUPERADMIN = 1,
  ADMIN = 2,
  TEAM_MEMBER = 3,
  CUSTOMER_USER = 4,
}

enum ENUM_User_Status {
  PENDING = 0,
  ACTIVE = 1,
  INACTIVE = 2,
}

enum ENUM_PREFIX_FILE_PATH {
  DOC = "docs",
}

enum ENUM_PERMISSION {
  VIEWER = 1,
  EDITOR = 2,
}

enum ENUM_DOCUMENT_TYPE_STATUS {
  ACTIVE = 1,
  INACTIVE = 2,
}

enum ENUM_REGION_STATUS {
  ACTIVE = 1,
  INACTIVE = 2,
}

enum ENUM_EVENT_TYPE_STATUS {
  ACTIVE = 1,
  INACTIVE = 2,
}

const ENUM_EVENT_TYPE_LOGS = {
  LOGIN: { id: 1, eventTypeName: "Login" },
  FORGOT_PASSWORD: { id: 2, eventTypeName: "Forgot Password" },
  RESET_PASSWORD: { id: 3, eventTypeName: "Reset Password" },
  LOGOUT: { id: 4, eventTypeName: "Logout" },
  SUPER_ADMIN_CREATED: { id: 5, eventTypeName: "Super Admin Created" },
  SUPER_ADMIN_UPDATED: { id: 6, eventTypeName: "Super Admin Updated" },
  SUPER_ADMIN_ACTIVATED: { id: 7, eventTypeName: "Super admin activated" },
  SUPER_ADMIN_DEACTIVATED: { id: 8, eventTypeName: "Super admin deactivated" },
  ADMIN_CREATED: { id: 9, eventTypeName: "Admin Created" },
  ADMIN_UPDATED: { id: 10, eventTypeName: "Admin Updated" },
  ADMIN_ACTIVATED: { id: 11, eventTypeName: "Admin activated" },
  ADMIN_DEACTIVATED: { id: 12, eventTypeName: "Admin deactivated" },
  TEAM_MEMBER_CREATED: { id: 13, eventTypeName: "Team Member Created" },
  TEAM_MEMBER_UPDATED: { id: 14, eventTypeName: "Team Member Updated" },
  TEAM_MEMBER_ACTIVATED: { id: 15, eventTypeName: "Team member activated" },
  TEAM_MEMBER_DEACTIVATED: { id: 16, eventTypeName: "Team member deactivated" },
  CUSTOMER_CREATED: { id: 17, eventTypeName: "Customer Created" },
  CUSTOMER_UPDATED: { id: 18, eventTypeName: "Customer Updated" },
  CUSTOMER_ACTIVATED: { id: 19, eventTypeName: "Customer activated" },
  CUSTOMER_DEACTIVATED: { id: 20, eventTypeName: "Customer deactivated" },
  CUSTOMER_USER_CREATED: { id: 21, eventTypeName: "Customer User Created" },
  CUSTOMER_USER_UPDATED: { id: 22, eventTypeName: "Customer User Updated" },
  CUSTOMER_USER_ACTIVATED: { id: 23, eventTypeName: "Customer user activated" },
  CUSTOMER_USER_DEACTIVATED: { id: 24, eventTypeName: "Customer user deactivated" },
  DOCUMENT_UPLOADED: { id: 25, eventTypeName: "Document Uploaded" },
  DOCUMENT_INFO_UPDATED: { id: 26, eventTypeName: "Document Info Updated" },
  DOCUMENT_PERMISSION_UPDATED: { id: 27, eventTypeName: "Document Permissions Updated" },
};

enum APP_ENVIRONMENT {
  PRODUCTION = "production",
  DEV = "dev",
  LOCAL = "local",
}

export {
  ENUM_User_ROLE,
  ENUM_User_Status,
  ENUM_PREFIX_FILE_PATH,
  ENUM_PERMISSION,
  ENUM_DOCUMENT_TYPE_STATUS,
  ENUM_REGION_STATUS,
  ENUM_EVENT_TYPE_STATUS,
  ENUM_EVENT_TYPE_LOGS,
  APP_ENVIRONMENT,
};
