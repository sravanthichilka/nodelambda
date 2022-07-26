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

describe("Customer Fetch Suit (GET /customers/15/documents/3/getCustomersForMoveDocument)", () => {
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
    it("fetch teammember, httpcode #200", async () => {
      const result = await request(app)
        .get(`/customers/fetch`)
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(200);
    });
  });

  describe("Logged in from admin", () => {
    it("fetch teammember, httpcode #200", async () => {
      const result = await request(app)
        .get(`/customers/fetch`)
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(200);
    });
  });

  describe("Logged in from teammember", () => {
    it("fetch teammember, httpcode #200", async () => {
      const result = await request(app)
        .get(`/customers/fetch`)
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(200);
    });
  });

  describe("Logged in from customer", () => {
    it("fetch teammember, httpcode #403", async () => {
      const result = await request(app)
        .get(`/customers/fetch`)
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(updateCustomerUserData);
      expect(result.statusCode).to.equal(403);
    });
  });
});
