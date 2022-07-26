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
  link: "http://google.com",
};

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";

describe("Customer onSiteSystemData Suit (PATCH /customers/:companyId/onSiteSystemData)", () => {
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
    it("update onSiteSystemData by superadmin, http code #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .patch(`/customers/1/onSiteSystemData`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(200);
    });

    it("send invalid field , logged in superadmin, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .patch(`/customers/1/onSiteSystemData`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from admin", () => {
    it("update onSiteSystemData by admin, http code #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .patch(`/customers/1/onSiteSystemData`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(200);
    });

    it("send invalid field , logged in admin, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .patch(`/customers/1/onSiteSystemData`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from teammember", () => {
    it("update onSiteSystemData customer #1 by teammember, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .patch(`/customers/1/onSiteSystemData`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });

    it("update onSiteSystemData customer #2 by teammember, http code #200", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .patch(`/customers/2/onSiteSystemData`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(200);
    });

    it("send invalid field customer #1  , logged in teammember, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .patch(`/customers/1/onSiteSystemData`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from customer", () => {
    it("update onSiteSystemData customer #1 by customer, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .patch(`/customers/1/onSiteSystemData`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });

    it("send invalid field customer #1  , logged in teammember, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .patch(`/customers/1/onSiteSystemData`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken)
        .send({ firstName1: "test" });
      expect(result.statusCode).to.equal(422);
    });
  });
});
