import { ENUM_User_ROLE } from "../../../helper/constants";
import app from "../../../main";
import request from "supertest";

const commonPassword = "Birko@123";
const roleLoginCredentails = {
  superAdmin: {
    credentails: {
      email: "superadmin@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.SUPERADMIN,
  },

  admin: {
    credentails: {
      email: "admin@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.ADMIN,
  },

  teamMember: {
    credentails: {
      email: "teammember@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.TEAM_MEMBER,
  },

  customer: {
    credentails: {
      email: "customer@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.CUSTOMER_USER,
  },

  deactiveSuperadmin: {
    credentails: {
      email: "deactive_superadmin@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.SUPERADMIN,
  },

  activeSuperadmindeactiveAfterForgotPassword: {
    credentails: {
      email: "active_superadmin_deactive_afterforgotpassword@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.SUPERADMIN,
  },

  deactiveAdmin: {
    credentails: {
      email: "deactive_admin@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.ADMIN,
  },

  deactiveTeamMember: {
    credentails: {
      email: "deactive_teammember@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.TEAM_MEMBER,
  },

  deactiveCustomerUser: {
    credentails: {
      email: "deactive_customeruser@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.TEAM_MEMBER,
  },

  settemporarypasswordSuperadmin: {
    credentails: {
      email: "settemporarypassword_superadmin@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.SUPERADMIN,
  },
};

const addUserWithRole = {
  addSuperAdminRoleBySuperAdmin: {
    credentails: {
      email: "add_user_s_s@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.SUPERADMIN,
  },
  addAdminRoleBySuperAdmin: {
    credentails: {
      email: "add_user_s_a@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.ADMIN,
  },

  addTeamRoleBySuperAdmin: {
    credentails: {
      email: "add_user_s_team@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.TEAM_MEMBER,
  },
  addTeamRoleByAdmin: {
    credentails: {
      email: "add_user_a_team@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.TEAM_MEMBER,
  },
};

const updateUserWithRole = {
  addSuperAdminRoleBySuperAdmin: {
    credentails: {
      email: "update_user_s_s@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.SUPERADMIN,
  },
  addAdminRoleBySuperAdmin: {
    credentails: {
      email: "update_user_s_a@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.ADMIN,
  },

  addTeamRoleBySuperAdmin: {
    credentails: {
      email: "update_user_s_team@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.TEAM_MEMBER,
  },
  addTeamRoleByAdmin: {
    credentails: {
      email: "update_user_a_team@yopmail.com",
      password: commonPassword,
    },
    role: ENUM_User_ROLE.TEAM_MEMBER,
  },
};

const addCustomerUser = {
  addBySuperAdmin: {
    credentails: {
      email: "pri_add_custuser_s@yopmail.com",
      password: "test",
    },
  },
};

const getLoginAccessTokenFn = async (credentails: any) => {
  const result = await request(app)
    .post("/auth/login")
    .set("user-agent", "mocha")
    .send(credentails);
  return result.body.data.accessToken;
};

const getLoginRefreshAccessTokenFn = async (credentails: any) => {
  const result = await request(app)
    .post("/auth/login")
    .set("user-agent", "mocha")
    .send(credentails);
  return result.body.data.refreshToken;
};

const getLoginDataFn = async (credentails: any) => {
  const result = await request(app)
    .post("/auth/login")
    .set("user-agent", "mocha")
    .send(credentails);
  return { accessToken: result.body.data.accessToken, refreshToken: result.body.data.refreshToken };
};

const getUserIdsFromCompanyFn = async (accessToken: string, companyId: number) => {
  const response = await request(app)
    .get(`/customers/${companyId}/users`)
    .set("user-agent", "mocha")
    .set("Authorization", accessToken);
  const userList: number[] = [];
  response.body.data.records.map((rec: { id: number }) => {
    userList.push(rec.id);
  });
  return userList;
};

const getCompanyIdsFn = async (accessToken: string) => {
  const response = await request(app)
    .get(`/customers/fetch`)
    .set("user-agent", "mocha")
    .set("Authorization", accessToken);
  const userList: number[] = [];
  response.body.data.records.map((rec: { companyId: number }) => {
    userList.push(rec.companyId);
  });
  return userList;
};

const getTeamUserIdsFn = async (accessToken: string) => {
  const response = await request(app)
    .get(`/teammembers/fetch`)
    .set("user-agent", "mocha")
    .set("Authorization", accessToken);
  const userList: number[] = [];
  response.body.data.records.map((rec: { id: number }) => {
    userList.push(rec.id);
  });
  return userList;
};

export {
  roleLoginCredentails,
  commonPassword,
  getLoginAccessTokenFn,
  getUserIdsFromCompanyFn,
  getLoginRefreshAccessTokenFn,
  getLoginDataFn,
  addUserWithRole,
  updateUserWithRole,
  getCompanyIdsFn,
  getTeamUserIdsFn,
  addCustomerUser,
};
