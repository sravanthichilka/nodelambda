import app from "../../../main";
import request from "supertest";

import { expect } from "chai";

import { ENUM_User_ROLE, ENUM_User_Status } from "../../../helper/constants";
import {
  commonPassword,
  roleLoginCredentails,
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

const updateUserStatus = {
  status: ENUM_User_Status.INACTIVE,
};

describe("Users Suit  (PATCH /users/:userId/status)", () => {
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
    it("update status user inactive #13 , httpcode #200", async () => {
      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.INACTIVE;

      const result = await request(app)
        .patch("/users/13/status")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(200);
    });

    it("update status user active #13 , httpcode #200", async () => {
      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.ACTIVE;

      const result = await request(app)
        .patch("/users/13/status")
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
    it("update status user inactive add_user_a_team@yopmail.com , httpcode #200", async () => {
      const condition = { email: "add_user_a_team@yopmail.com" };
      const user: any = await userRepo.searchUser(condition);
      const teamId = user.id;

      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.INACTIVE;

      const result = await request(app)
        .patch("/users/" + teamId + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(200);
    });

    it("update status user active add_user_a_team@yopmail.com , httpcode #200", async () => {
      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.ACTIVE;

      const condition = { email: "add_user_a_team@yopmail.com" };
      const user: any = await userRepo.searchUser(condition);
      const teamId = user.id;

      const result = await request(app)
        .patch("/users/" + teamId + "/status")
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
    it("update status user inactive #13 , httpcode #403", async () => {
      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.INACTIVE;

      const result = await request(app)
        .patch("/users/13/status")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("update status user active #13 , httpcode #403", async () => {
      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.ACTIVE;

      const result = await request(app)
        .patch("/users/13/status")
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
    it("update status user inactive #13 , httpcode #403", async () => {
      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.INACTIVE;

      const result = await request(app)
        .patch("/users/13/status")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("update status user active #13 , httpcode #403", async () => {
      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.ACTIVE;

      const result = await request(app)
        .patch("/users/13/status")
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
    it("admin ->  superadmin , update user superadmin@yopmail.com with inactive, httpcode #403", async () => {
      const condition = { email: roleLoginCredentails.superAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const superAdminId = user.id;

      const admin1 = await getLoginDataFn(roleLoginCredentails.admin.credentails);

      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.INACTIVE;

      const result = await request(app)
        .patch("/users/" + superAdminId + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", admin1.accessToken)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("admin ->  admin , update user superadmin@yopmail.com with active, httpcode #403", async () => {
      const condition = { email: roleLoginCredentails.deactiveAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const AdminId = user.id;

      const admin1 = await getLoginDataFn(roleLoginCredentails.admin.credentails);

      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.ACTIVE;

      const result = await request(app)
        .patch("/users/" + AdminId + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", admin1.accessToken)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });
  });

  describe("CROSS:IN: Logged in from teammember, update admin record", () => {
    it("teammember ->  supeadmin , update user admin@yopmail.com with role superadmin, httpcode #403", async () => {
      const condition = { email: roleLoginCredentails.superAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const adminId = user.id;

      const teamMember1 = await getLoginDataFn(roleLoginCredentails.teamMember.credentails);

      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.ACTIVE;

      const result = await request(app)
        .patch("/users/" + adminId + "/status")
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

      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.ACTIVE;

      const result = await request(app)
        .patch("/users/" + adminId + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", teamMember1.accessToken)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });
  });

  describe("CROSS:IN: Logged in from customer, update teammember record", () => {
    it("customer ->  superadmin , update user customer@yopmail.com with role superadmin, httpcode #403", async () => {
      const condition = { email: roleLoginCredentails.superAdmin.credentails.email };
      const user: any = await userRepo.searchUser(condition);
      const adminId = user.id;

      const customer1 = await getLoginDataFn(roleLoginCredentails.customer.credentails);

      const addUpdateUserClone = { ...updateUserStatus };
      addUpdateUserClone.status = ENUM_User_Status.ACTIVE;

      const result = await request(app)
        .patch("/users/" + adminId + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", customer1.accessToken)
        .send(addUpdateUserClone);

      expect(result.statusCode).to.equal(403);
    });
  });
});
