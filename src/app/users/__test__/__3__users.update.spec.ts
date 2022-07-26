import app from "../../../main";
import request from "supertest";

import { expect } from "chai";

import { ENUM_User_ROLE, ENUM_User_Status } from "../../../helper/constants";
import {
  commonPassword,
  roleLoginCredentails,
  addUserWithRole,
  updateUserWithRole,
  getLoginDataFn,
  getUserIdsFromCompanyFn,
} from "../../customers/__test__/helper";
import userRepo from "../../users/users.repo";

let SUPERADMIN_REFRESH_ACCESS_TOKEN = "";
let ADMIN_REFRESH_ACCESS_TOKEN = "";
let TEAMMEMBER_REFRESH_ACCESS_TOKEN = "";
let CUSTOMER_USER_REFRESH_ACCESS_TOKEN = "";

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";

const updateAUser = {
  firstName: "update_ns",
  lastName: "ns",
};

// update_user_s_s@yopmail.com
// update_user_s_a@yopmail.com
//   update_user_a_team@yopmail.com

describe("Users Suit (POST /users/:userId)", () => {
  before(async function () {
    const superAdmin = await getLoginDataFn(roleLoginCredentails.superAdmin.credentails);
    SUPERADMIN_ACCESS_TOKEN = superAdmin.accessToken;
    SUPERADMIN_REFRESH_ACCESS_TOKEN = superAdmin.refreshToken;

    const admin = await getLoginDataFn(roleLoginCredentails.admin.credentails);
    ADMIN_ACCESS_TOKEN = admin.accessToken;
    ADMIN_REFRESH_ACCESS_TOKEN = admin.refreshToken;

    const teammember = await getLoginDataFn(roleLoginCredentails.teamMember.credentails);
    TEAMMEMBER_ACCESS_TOKEN = teammember.accessToken;
    TEAMMEMBER_REFRESH_ACCESS_TOKEN = teammember.refreshToken;

    const customeruser = await getLoginDataFn(roleLoginCredentails.customer.credentails);
    CUSTOMER_USER_ACCESS_TOKEN = customeruser.accessToken;
    CUSTOMER_USER_REFRESH_ACCESS_TOKEN = customeruser.refreshToken;
  });

  describe("Logged in from Superadmin", () => {
    it("update user with role superadmin, httpcode #422", async () => {
      const condition = { email: addUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const userId = user.id;

      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email= updateUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email;
      addUpdateUserClone.role = updateUserWithRole.addSuperAdminRoleBySuperAdmin.role;

      const result = await request(app)
        .put("/users/" + userId)
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(422);
    });

    it("update user role superadmin, with email,  httpcode #200", async () => {
      const condition = { email: addUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const userId = user.id;

      const addUpdateUserClone = { ...updateAUser };
      // addUpdateUserClone.email= updateUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email;

      const result = await request(app)
        .put("/users/" + userId)
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(200);
    });

    it("update user with role admin, httpcode #422", async () => {
      const condition = { email: addUserWithRole.addAdminRoleBySuperAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const userId = user.id;

      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email= updateUserWithRole.addAdminRoleBySuperAdmin.credentails.email;
      addUpdateUserClone.role = updateUserWithRole.addAdminRoleBySuperAdmin.role;

      const result = await request(app)
        .put("/users/" + userId)
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(422);
    });

    it("update user role admin, with email,  httpcode #200", async () => {
      const condition = { email: addUserWithRole.addAdminRoleBySuperAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const userId = user.id;

      const addUpdateUserClone = { ...updateAUser };
      // addUpdateUserClone.email= updateUserWithRole.addAdminRoleBySuperAdmin.credentails.email;

      const result = await request(app)
        .put("/users/" + userId)
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(200);
    });

    it("update user with role teammember, without regionId, phonenumber,  httpcode #422", async () => {
      const condition = { email: addUserWithRole.addTeamRoleBySuperAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const userId = user.id;

      const addUpdateUserClone = { ...updateAUser };
      // addUpdateUserClone.email= updateUserWithRole.addTeamRoleBySuperAdmin.credentails.email;

      const result = await request(app)
        .put("/users/" + userId)
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(422);
    });

    it("update user with role teammember, with regionId, phonenumber,  httpcode #200", async () => {
      const condition = { email: addUserWithRole.addTeamRoleBySuperAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const userId = user.id;

      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email= updateUserWithRole.addTeamRoleBySuperAdmin.credentails.email;
      addUpdateUserClone.regionId = 1;
      addUpdateUserClone.phoneNumber = "9823456788";

      const result = await request(app)
        .put("/users/" + userId)
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(200);
    });

    it("dont send field, httpcode #422", async () => {
      const result = await request(app)
        .put("/users/26")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send({});

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from admin", () => {
    it("update user with role superadmin, httpcode #403", async () => {
      const condition = { email: addUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const userId = user.id;

      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email= updateUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email;

      const result = await request(app)
        .put("/users/" + userId)
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("update user with role teammember, with regionId, phonenumber,  httpcode #200", async () => {
      const condition = { email: addUserWithRole.addTeamRoleByAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const teamId = user.id;

      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email= updateUserWithRole.addTeamRoleByAdmin.credentails.email;
      addUpdateUserClone.regionId = 1;
      addUpdateUserClone.phoneNumber = "9823451234";
      const result = await request(app)
        .put("/users/" + teamId)
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(200);
    });

    it("dont send field, httpcode #422", async () => {
      const result = await request(app)
        .put("/users/26")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send({});

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from teammember", () => {
    it("update user with role superadmin, httpcode #403", async () => {
      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email="update_user_s_s@yopmail.com";
      addUpdateUserClone.role = ENUM_User_ROLE.SUPERADMIN;

      const result = await request(app)
        .put("/users/13")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("update user with role admin, httpcode #403", async () => {
      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email="update_user_s_s@yopmail.com";
      addUpdateUserClone.role = ENUM_User_ROLE.ADMIN;

      const result = await request(app)
        .put("/users/13")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("update user with role teammember, with regionId, phonenumber,  httpcode #403", async () => {
      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email="update_user_a_team@yopmail.com";
      addUpdateUserClone.role = ENUM_User_ROLE.TEAM_MEMBER;
      addUpdateUserClone.regionId = 1;
      addUpdateUserClone.phoneNumber = "9823451234";
      const result = await request(app)
        .put("/users/26")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("update user with role teammember, without regionId, phonenumber,  httpcode #403", async () => {
      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email="update_user_a_team@yopmail.com";
      addUpdateUserClone.role = ENUM_User_ROLE.TEAM_MEMBER;
      const result = await request(app)
        .put("/users/26")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("dont send field, httpcode #403", async () => {
      const result = await request(app)
        .put("/users/26")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send({});

      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from customer", () => {
    it("update user with role superadmin, httpcode #403", async () => {
      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email="update_user_s_s@yopmail.com";
      addUpdateUserClone.role = ENUM_User_ROLE.SUPERADMIN;

      const result = await request(app)
        .put("/users/13")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("update user with role admin, httpcode #403", async () => {
      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email="update_user_s_s@yopmail.com";
      addUpdateUserClone.role = ENUM_User_ROLE.ADMIN;

      const result = await request(app)
        .put("/users/13")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("update user with role teammember, with regionId, phonenumber,  httpcode #403", async () => {
      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email="update_user_a_team@yopmail.com";
      addUpdateUserClone.role = ENUM_User_ROLE.TEAM_MEMBER;
      addUpdateUserClone.regionId = 1;
      addUpdateUserClone.phoneNumber = "9823451234";
      const result = await request(app)
        .put("/users/26")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("update user with role teammember, without regionId, phonenumber,  httpcode #403", async () => {
      const addUpdateUserClone: any = { ...updateAUser };
      // addUpdateUserClone.email="update_user_a_team@yopmail.com";
      addUpdateUserClone.role = ENUM_User_ROLE.TEAM_MEMBER;
      const result = await request(app)
        .put("/users/26")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("dont send field, httpcode #403", async () => {
      const result = await request(app)
        .put("/users/26")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send({});

      expect(result.statusCode).to.equal(403);
    });
  });

  describe("CROSS:IN: Logged in from admin, update superadmin record", () => {
    it("admin ->  superadmin , update user superadmin@yopmail.com with role superadmin, httpcode #403", async () => {
      const condition = { email: roleLoginCredentails.superAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const superAdminId = user.id;

      const admin1 = await getLoginDataFn(roleLoginCredentails.admin.credentails);

      const addUpdateUserClone = { ...updateAUser };
      // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";

      const result = await request(app)
        .put("/users/" + superAdminId)
        .set("user-agent", "mocha")
        .set("Authorization", admin1.accessToken)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("admin ->  superadmin , update user superadmin@yopmail.com with role admin, httpcode #403", async () => {
      const condition = { email: roleLoginCredentails.superAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const superAdminId = user.id;

      const admin1 = await getLoginDataFn(roleLoginCredentails.admin.credentails);

      const addUpdateUserClone = { ...updateAUser };
      // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";

      const result = await request(app)
        .put("/users/" + superAdminId)
        .set("user-agent", "mocha")
        .set("Authorization", admin1.accessToken)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });
  });

  describe("CROSS:IN: Logged in from teammember, update admin record", () => {
    it("teammember ->  supeadmin , update user admin@yopmail.com with role superadmin, httpcode #403", async () => {
      const condition = { email: roleLoginCredentails.admin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const adminId = user.id;

      const teamMember1 = await getLoginDataFn(roleLoginCredentails.teamMember.credentails);

      const addUpdateUserClone = { ...updateAUser };
      // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";

      const result = await request(app)
        .put("/users/" + adminId)
        .set("user-agent", "mocha")
        .set("Authorization", teamMember1.accessToken)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("teammember ->  admin , update user admin@yopmail.com with role admin, httpcode #403", async () => {
      const condition = { email: roleLoginCredentails.admin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const adminId = user.id;

      const teamMember1 = await getLoginDataFn(roleLoginCredentails.teamMember.credentails);

      const addUpdateUserClone = { ...updateAUser };
      // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";

      const result = await request(app)
        .put("/users/" + adminId)
        .set("user-agent", "mocha")
        .set("Authorization", teamMember1.accessToken)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("teammember ->  teammember , update user teammember@yopmail.com with role teammember, httpcode #403", async () => {
      const condition = { email: roleLoginCredentails.teamMember.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const adminId = user.id;

      const teamMember1 = await getLoginDataFn(roleLoginCredentails.teamMember.credentails);

      const addUpdateUserClone = { ...updateAUser };
      // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";

      const result = await request(app)
        .put("/users/" + adminId)
        .set("user-agent", "mocha")
        .set("Authorization", teamMember1.accessToken)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });
  });

  describe("CROSS:IN: Logged in from customer, update teammember record", () => {
    it("customer ->  superadmin , update user customer@yopmail.com with role superadmin, httpcode #403", async () => {
      const condition = { email: roleLoginCredentails.admin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const adminId = user.id;

      const customer1 = await getLoginDataFn(roleLoginCredentails.customer.credentails);

      const addUpdateUserClone = { ...updateAUser };
      // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";

      const result = await request(app)
        .put("/users/" + adminId)
        .set("user-agent", "mocha")
        .set("Authorization", customer1.accessToken)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("customer ->  admin , update user admin@yopmail.com with role admin, httpcode #403", async () => {
      const condition = { email: roleLoginCredentails.admin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const adminId = user.id;

      const customer1 = await getLoginDataFn(roleLoginCredentails.customer.credentails);

      const addUpdateUserClone = { ...updateAUser };
      // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";

      const result = await request(app)
        .put("/users/" + adminId)
        .set("user-agent", "mocha")
        .set("Authorization", customer1.accessToken)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("customer ->  teammember , update user teammember@yopmail.com with role teammember, httpcode #403", async () => {
      const condition = { email: roleLoginCredentails.teamMember.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const adminId = user.id;

      const customer1 = await getLoginDataFn(roleLoginCredentails.customer.credentails);

      const addUpdateUserClone = { ...updateAUser };
      // addUpdateUserClone.email="add_user_a_superadmin@yopmail.com";

      const result = await request(app)
        .put("/users/" + adminId)
        .set("user-agent", "mocha")
        .set("Authorization", customer1.accessToken)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });
  });
});
