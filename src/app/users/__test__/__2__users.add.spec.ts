import app from "../../../main";
import request from "supertest";

import { expect } from "chai";

import { ENUM_User_ROLE, ENUM_User_Status } from "../../../helper/constants";
import {
  commonPassword,
  roleLoginCredentails,
  addUserWithRole,
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

const addNewUser = {
  firstName: "add_new_user_fn",
  lastName: "add_new_user_ln",
  email: "add_new_user@yopmail.com",
  temporaryPassword: commonPassword,
  role: 1,
};

describe("Users Suit (POST /users)", () => {
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
    it("add user with role superadmin, httpcode #201", async () => {
      const addNewUserClone = { ...addNewUser };
      addNewUserClone.email = addUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email;
      addNewUserClone.role = addUserWithRole.addSuperAdminRoleBySuperAdmin.role;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(201);
      expect(result.body.data).to.have.property("id");
    });

    it("add user with role superadmin, send regionId, phonenumber,  httpcode #422", async () => {
      const addNewUserClone: any = { ...addNewUser };
      addNewUserClone.email = addUserWithRole.addSuperAdminRoleBySuperAdmin.credentails.email;
      addNewUserClone.role = addUserWithRole.addSuperAdminRoleBySuperAdmin.role;
      addNewUserClone.regionId = 1;
      addNewUserClone.phoneNumber = "9823456789";
      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(422);
    });

    it("add user with role admin, httpcode #201", async () => {
      const addNewUserClone: any = { ...addNewUser };

      addNewUserClone.email = addUserWithRole.addAdminRoleBySuperAdmin.credentails.email;
      addNewUserClone.role = addUserWithRole.addAdminRoleBySuperAdmin.role;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(201);
      expect(result.body.data).to.have.property("id");
    });

    it("add user with role team, httpcode #201", async () => {
      const addNewUserClone: any = { ...addNewUser };

      addNewUserClone.email = addUserWithRole.addTeamRoleBySuperAdmin.credentails.email;
      addNewUserClone.role = addUserWithRole.addTeamRoleBySuperAdmin.role;
      addNewUserClone.regionId = 1;
      addNewUserClone.phoneNumber = "9823456789";

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(201);
      expect(result.body.data).to.have.property("id");
    });

    it("add user with role teammember, without regionId,phoneNumber , httpcode #422", async () => {
      const addNewUserClone: any = { ...addNewUser };
      addNewUserClone.email = addUserWithRole.addTeamRoleBySuperAdmin.credentails.email;
      addNewUserClone.role = addUserWithRole.addTeamRoleBySuperAdmin.role;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(422);
    });

    it("dont send field, superadmin@yopmail.com, httpcode #422", async () => {
      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send({});

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from admin", () => {
    it("add user with role superadmin, httpcode #403", async () => {
      const addNewUserClone = { ...addNewUser };
      addNewUserClone.email = "add_user_a_s@yopmail.com";
      addNewUserClone.role = ENUM_User_ROLE.SUPERADMIN;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("add user with role admin, httpcode #403", async () => {
      const addNewUserClone = { ...addNewUser };
      addNewUserClone.email = "add_user_a_a@yopmail.com";
      addNewUserClone.role = ENUM_User_ROLE.ADMIN;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("add user with role team, without regionId,phoneNumber , httpcode #422", async () => {
      const addNewUserClone: any = { ...addNewUser };
      addNewUserClone.email = addUserWithRole.addTeamRoleByAdmin.credentails.email;
      addNewUserClone.role = addUserWithRole.addTeamRoleByAdmin.role;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(422);
    });

    it("add user with role teammember, with regionId,phoneNumber httpcode #201", async () => {
      const addNewUserClone: any = { ...addNewUser };
      addNewUserClone.email = addUserWithRole.addTeamRoleByAdmin.credentails.email;
      addNewUserClone.role = addUserWithRole.addTeamRoleByAdmin.role;
      addNewUserClone.regionId = 1;
      addNewUserClone.phoneNumber = "9823456789";

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(201);
      expect(result.body.data).to.have.property("id");
    });

    it("add user with role customer, httpcode #422", async () => {
      const addNewUserClone: any = { ...addNewUser };
      addNewUserClone.email = "add_user_a_customer@yopmail.com";
      addNewUserClone.role = ENUM_User_ROLE.CUSTOMER_USER;
      addNewUserClone.regionId = 1;
      addNewUserClone.phoneNumber = "9823456789";

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(422);
    });

    it("dont send field, httpcode #422", async () => {
      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send({});

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from teammember", () => {
    it("add user with role superadmin, httpcode #403", async () => {
      const addNewUserClone = { ...addNewUser };
      addNewUserClone.email = "add_user_a_s@yopmail.com";
      addNewUserClone.role = ENUM_User_ROLE.SUPERADMIN;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("add user with role admin, httpcode #403", async () => {
      const addNewUserClone = { ...addNewUser };
      addNewUserClone.email = "add_user_a_a@yopmail.com";
      addNewUserClone.role = ENUM_User_ROLE.ADMIN;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("add user with role team, with regionId,phoneNumber , httpcode #403", async () => {
      const addNewUserClone: any = { ...addNewUser };
      addNewUserClone.email = addUserWithRole.addAdminRoleBySuperAdmin.credentails.email;
      addNewUserClone.role = addUserWithRole.addAdminRoleBySuperAdmin.role;
      addNewUserClone.regionId = 1;
      addNewUserClone.phoneNumber = "9823456789";

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("add user with role teammember, with regionId,phoneNumber httpcode #403", async () => {
      const addNewUserClone: any = { ...addNewUser };
      addNewUserClone.email = addUserWithRole.addTeamRoleByAdmin.credentails.email;
      addNewUserClone.role = addUserWithRole.addTeamRoleByAdmin.role;
      addNewUserClone.regionId = 1;
      addNewUserClone.phoneNumber = "9823456789";

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("add user with role customer, httpcode #403", async () => {
      const addNewUserClone: any = { ...addNewUser };
      addNewUserClone.email = "add_user_a_customer@yopmail.com";
      addNewUserClone.role = ENUM_User_ROLE.CUSTOMER_USER;
      addNewUserClone.regionId = 1;
      addNewUserClone.phoneNumber = "9823456789";

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("dont send field, httpcode #403", async () => {
      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send({});

      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from customer", () => {
    it("add user with role superadmin, httpcode #403", async () => {
      const addNewUserClone = { ...addNewUser };
      addNewUserClone.email = "add_user_a_s@yopmail.com";
      addNewUserClone.role = ENUM_User_ROLE.SUPERADMIN;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("add user with role admin, httpcode #403", async () => {
      const addNewUserClone = { ...addNewUser };
      addNewUserClone.email = "add_user_a_a@yopmail.com";
      addNewUserClone.role = ENUM_User_ROLE.ADMIN;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("add user with role team, with regionId,phoneNumber , httpcode #403", async () => {
      const addNewUserClone: any = { ...addNewUser };
      addNewUserClone.email = addUserWithRole.addAdminRoleBySuperAdmin.credentails.email;
      addNewUserClone.role = addUserWithRole.addAdminRoleBySuperAdmin.role;

      addNewUserClone.regionId = 1;
      addNewUserClone.phoneNumber = "9823456789";

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("add user with role teammember, with regionId,phoneNumber httpcode #403", async () => {
      const addNewUserClone: any = { ...addNewUser };
      addNewUserClone.email = addUserWithRole.addTeamRoleByAdmin.credentails.email;
      addNewUserClone.role = addUserWithRole.addTeamRoleByAdmin.role;
      addNewUserClone.regionId = 1;
      addNewUserClone.phoneNumber = "9823456789";

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("add user with role customer, httpcode #403", async () => {
      const addNewUserClone: any = { ...addNewUser };
      addNewUserClone.email = "add_user_a_customer@yopmail.com";
      addNewUserClone.role = ENUM_User_ROLE.CUSTOMER_USER;
      addNewUserClone.regionId = 1;
      addNewUserClone.phoneNumber = "9823456789";

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });

    it("dont send field, httpcode #403", async () => {
      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send({});

      expect(result.statusCode).to.equal(403);
    });
  });

  describe("CROSS:IN: Logged in from admin, update superadmin record", () => {
    it("admin ->  superadmin , add user with role superadmin, httpcode #403", async () => {
      const admin1 = await getLoginDataFn(roleLoginCredentails.admin.credentails);

      const addNewUserClone = { ...addNewUser };
      addNewUserClone.email = "add_user_a_superadmin@yopmail.com";
      addNewUserClone.role = ENUM_User_ROLE.SUPERADMIN;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", admin1.accessToken)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });
  });

  describe("CROSS:IN: Logged in from teammember, update admin record", () => {
    it("teammember ->  admin , add user with role superadmin, httpcode #403", async () => {
      const teamMember1 = await getLoginDataFn(roleLoginCredentails.teamMember.credentails);
      const admin1 = await getLoginDataFn(roleLoginCredentails.admin.credentails);

      const addNewUserClone = { ...addNewUser };
      addNewUserClone.email = "add_user_a_superadmin@yopmail.com";
      addNewUserClone.role = ENUM_User_ROLE.SUPERADMIN;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", teamMember1.accessToken)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });
  });

  describe("CROSS:IN: Logged in from customer, update teammember record", () => {
    it("customer ->  teammember , httpcode #403", async () => {
      const teamMember1 = await getLoginDataFn(roleLoginCredentails.teamMember.credentails);
      const customer1 = await getLoginDataFn(roleLoginCredentails.customer.credentails);

      const addNewUserClone = { ...addNewUser };
      addNewUserClone.email = "add_user_a_superadmin@yopmail.com";
      addNewUserClone.role = ENUM_User_ROLE.SUPERADMIN;

      const result = await request(app)
        .post("/users")
        .set("user-agent", "mocha")
        .set("Authorization", customer1.accessToken)
        .send(addNewUserClone);

      expect(result.statusCode).to.equal(403);
    });
  });
});
