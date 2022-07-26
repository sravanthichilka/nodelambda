import app from "../../../main";
import request from "supertest";

import { expect } from "chai";
import { ENUM_User_ROLE, ENUM_User_Status } from "../../../helper/constants";

import {
  commonPassword,
  roleLoginCredentails,
  getLoginAccessTokenFn,
  getUserIdsFromCompanyFn,
} from "../../customers/__test__/helper";

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";

describe("move Document Suit (POST /customers/:companyId/documents/:documentId/getCustomersForMoveDocument?filter[nameOrUniqueId]=appit_9)", () => {
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
    it("without search by superadmin, http code #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/1/documents/2/getCustomersForMoveDocument`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("without search by superadmin, invalid company #123123, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/123123/documents/2/getCustomersForMoveDocument`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(422);
    });

    it("with search filter by superadmin, http code #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter[nameOrUniqueId]=app`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("invalid field name, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter1[nameOrUniqueId1]=app`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from admin", () => {
    it("without search by admin, http code #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/1/documents/2/getCustomersForMoveDocument`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("without search by admin, invalid company #123123, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/123123/documents/2/getCustomersForMoveDocument`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(422);
    });

    it("with search filter by admin, http code #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter[nameOrUniqueId]=app`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
    });

    it("invalid field name, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter1[nameOrUniqueId1]=app`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from teammember", () => {
    it("without search by teammember, not link customer, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/1/documents/2/getCustomersForMoveDocument`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("without search by teammember, invalid company #123123, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/123123/documents/2/getCustomersForMoveDocument`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(422);
    });

    it("with search filter by teammember, link http code #200", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/2/documents/2/getCustomersForMoveDocument?filter[nameOrUniqueId]=app`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(200);
    });

    it("with search filter by teammember, not link http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter[nameOrUniqueId]=app`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("invalid field name, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/2/documents/2/getCustomersForMoveDocument?filter1[nameOrUniqueId1]=app`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from customer", () => {
    it("without search by customer, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/1/documents/2/getCustomersForMoveDocument`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("without search by teammember, invalid company #123123, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/123123/documents/2/getCustomersForMoveDocument`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("with search filter by customer, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter[nameOrUniqueId]=app`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("invalid field name, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get(`/customers/1/documents/2/getCustomersForMoveDocument?filter1[nameOrUniqueId1]=app`)
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(403);
    });
  });
});
