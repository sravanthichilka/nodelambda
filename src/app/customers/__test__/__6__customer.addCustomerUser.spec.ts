import app from "../../../main";
import request from "supertest";

import { expect } from "chai";
import { ENUM_User_ROLE, ENUM_User_Status } from "../../../helper/constants";
import {
  commonPassword,
  roleLoginCredentails,
  getLoginAccessTokenFn,
  getUserIdsFromCompanyFn,
} from "./helper";

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";

const addCustomerUserData = {
  firstName: "ns",
  lastName: "ns",
  email: "new_cu1@yopmail.com",
  temporaryPassword: commonPassword,
};

describe("Add CustomerUser Suit POST /customers/:companyId/users", () => {
  before(async function () {
    SUPERADMIN_ACCESS_TOKEN = await getLoginAccessTokenFn(
      roleLoginCredentails.superAdmin.credentails
    );
    ADMIN_ACCESS_TOKEN = await getLoginAccessTokenFn(roleLoginCredentails.admin.credentails);
    TEAMMEMBER_ACCESS_TOKEN = await getLoginAccessTokenFn(
      roleLoginCredentails.teamMember.credentails
    );
    CUSTOMER_USER_ACCESS_TOKEN = await getLoginAccessTokenFn(
      roleLoginCredentails.customer.credentails
    );
  });

  describe("Logged in from Superadmin", () => {
    it("Add customer user in company id #1 by superadmin", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .post("/customers/1/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(201);
    });

    it("Duplicate customer user adding by company id #1 by superadmin, http code #409", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .post("/customers/1/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(409);
    });

    it("Add customer user in not exist companyId #1234 by superadmin, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .post("/customers/1234/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(422);
    });

    it("Not send email field in add customer user companyId #1 by superadmin, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .post("/customers/1234/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from admin", () => {
    it("Add customer user in company id #1 by admin", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_admin_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .post("/customers/1/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(201);
    });

    it("Add customer user in not exist companyId #1234 by admin, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .post("/customers/1234/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(422);
    });

    it("Not send email field in add customer user companyId #1 by admin, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .post("/customers/1234/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from teammember", () => {
    it("Add customer user in company id #1, not linked with company by teammember, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .post("/customers/1/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(403);
    });

    it("Add customer user in company id #1, linked with company #2 by teammember, http code #201", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_tm_cu2@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .post("/customers/2/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(201);
    });

    it("Add customer user in not exist companyId #1234 by teamMember, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .post("/customers/1234/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(422);
    });

    it("Not send email field in add customer user companyId #1 by teamMember, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .post("/customers/1234/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(422);
    });

    it("Add customer user in company id #1 by teamMember, not link with company #1, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.lastName = "new_cu1";
      addCustomerUserDataCopy.email = "new_tm_cu1@yopmail.com";

      const result = await request(app)
        .post("/customers/1/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from customer", () => {
    it("Add customer user in company id #1 by customer, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .post("/customers/1234/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(addCustomerUserDataCopy);

      expect(result.statusCode).to.equal(403);
    });
  });
});
