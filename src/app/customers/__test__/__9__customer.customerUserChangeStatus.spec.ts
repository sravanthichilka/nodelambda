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

const updateCustomerUserData = {
  status: ENUM_User_Status.INACTIVE,
};

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
let company_1_UserListIds: number[] = [];
let company_2_UserListIds: number[] = [];

describe("Update Customer User STATUS Suit (PATCH /customers/:companyId/users/:userId/status)", () => {
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

    company_1_UserListIds = await getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 1);
    company_2_UserListIds = await getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 2);
  });

  describe("Logged in from Superadmin", () => {
    it("change user status inactive of company id #1 by superadmin, http code #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/1/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(200);
    });

    it("again change user status inactive of company id #1 by superadmin, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/1/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);

      expect(result.statusCode).to.equal(422);
    });

    it("send invalid field , logged in superadmin, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/1/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("company does not exist, logged in superadmin, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/123423/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("update customer user in wrong companyId, http code #403", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/2/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from admin", () => {
    it("change user status  active of company id #1 by admin, http code #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      updateCustomerUserData.status = ENUM_User_Status.ACTIVE;

      const result = await request(app)
        .patch(`/customers/1/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(200);
    });

    it("again change user status active of company id #1 by admin, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      updateCustomerUserData.status = ENUM_User_Status.ACTIVE;

      const result = await request(app)
        .patch(`/customers/1/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);

      expect(result.statusCode).to.equal(422);
    });

    it("send invalid field , logged in admin, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/1/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("company does not exist, logged in admin, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/123423/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("update customer user in wrong companyId by admin, http code #403", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/2/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from teammember", () => {
    it("change user status  inactive of company id #1, not link with company#1 by teammember, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      updateCustomerUserData.status = ENUM_User_Status.INACTIVE;

      const result = await request(app)
        .patch(`/customers/1/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });

    it("change user status  inactive of link with company#2 by teammember, http code #200", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      const userId = company_2_UserListIds[0];

      updateCustomerUserData.status = ENUM_User_Status.INACTIVE;

      const result = await request(app)
        .patch(`/customers/2/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(200);
    });

    it("again change user status inactive of company id #2 by teammember, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      const userId = company_2_UserListIds[0];

      updateCustomerUserData.status = ENUM_User_Status.INACTIVE;

      const result = await request(app)
        .patch(`/customers/2/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);

      expect(result.statusCode).to.equal(422);
    });

    it("change user status active of company id #2 by teammember, http code #200", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      const userId = company_2_UserListIds[0];

      updateCustomerUserData.status = ENUM_User_Status.ACTIVE;

      const result = await request(app)
        .patch(`/customers/2/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);

      expect(result.statusCode).to.equal(200);
    });

    it("send invalid field , logged in teammember, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/1/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("company does not exist, logged in teammember, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/123423/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("update customer user in wrong companyId by teammember, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/2/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from customeruser", () => {
    it("change user status  inactive of company id #1, not link with company#1 by customeruser, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      updateCustomerUserData.status = ENUM_User_Status.INACTIVE;

      const result = await request(app)
        .patch(`/customers/1/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });

    it("change user status  inactive of link with company#2 by customeruser, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      const userId = company_2_UserListIds[0];

      updateCustomerUserData.status = ENUM_User_Status.INACTIVE;

      const result = await request(app)
        .patch(`/customers/2/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });

    it("again change user status inactive of company id #2 by customeruser, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      const userId = company_2_UserListIds[0];

      updateCustomerUserData.status = ENUM_User_Status.INACTIVE;

      const result = await request(app)
        .patch(`/customers/2/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);

      expect(result.statusCode).to.equal(403);
    });

    it("send invalid field , logged in customeruser, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/1/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(403);
    });

    it("company does not exist, logged in customeruser, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/123423/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(403);
    });

    it("update customer user in wrong companyId by customeruser, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .patch(`/customers/2/users/${userId}/status`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });
  });
});
