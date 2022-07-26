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
  firstName: "ns",
  lastName: "ns",
};

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
let company_1_UserListIds: number[] = [];

describe("Update Customer User Suit (PUT /customers/:companyId/users/:userId)", () => {
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
  });

  describe("Logged in from Superadmin", () => {
    it("update customer user in company id #1 by superadmin, http code #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/1/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(200);
    });

    it("send invalid field , logged in superadmin, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/1/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("company does not exist, logged in superadmin, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/123423/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("update customer user in wrong companyId, http code #403", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/2/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from Admin", () => {
    it("update customer user in company id #1 by superadmin, http code #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/1/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(200);
    });

    it("send invalid field , logged in superadmin, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/1/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("company does not exist, logged in superadmin, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/123423/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("update customer user in wrong companyId, http code #403", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/2/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from Teammember", () => {
    it("update customer user in company id #1 by teammember, not link in company#1, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/1/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });

    it("send invalid field , logged in teammember, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/1/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("company does not exist, logged in teammember, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/123423/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });

    it("update customer user in wrong companyId by teammember, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/2/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from customerUser", () => {
    it("update customer user in company id #1 by teammember, not link in company#1, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/1/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });

    it("send invalid field , logged in customerUser, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/1/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(403);
    });

    it("company does not exist, logged in customerUser, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/123423/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(403);
    });

    it("update customer user in wrong companyId by customerUser, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;
      const userId = company_1_UserListIds[0];

      const result = await request(app)
        .put(`/customers/2/users/${userId}`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });
  });
});
