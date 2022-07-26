import app from "../../../main";
import request from "supertest";

import { expect } from "chai";
import { ENUM_User_Status } from "../../../helper/constants";
import {
  commonPassword,
  roleLoginCredentails,
  getCompanyIdsFn,
  getLoginAccessTokenFn,
  getUserIdsFromCompanyFn,
} from "./helper";
import userRepo from "../../users/users.repo";

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
let company_1_UserListIds: number[] = [];
let company_2_UserListIds: number[] = [];
let companyListIds: number[] = [];

describe("Customer Suit (PATCH /customers/:companyId/status)", () => {
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
    companyListIds = await getCompanyIdsFn(SUPERADMIN_ACCESS_TOKEN);
    companyListIds.sort();
    company_1_UserListIds = await getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 1);
    company_2_UserListIds = await getUserIdsFromCompanyFn(SUPERADMIN_ACCESS_TOKEN, 2);
  });

  describe("Logged in from Superadmin", () => {
    it("inactive customer #1, by superadmin,  http code 200", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[0] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.INACTIVE });

      expect(result.statusCode).to.equal(200);
    });

    it("inactive customer #3, by superadmin,  http code 200", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[2] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.INACTIVE });

      expect(result.statusCode).to.equal(200);
    });

    it("active customer  #1, by superadmin,  http code 200", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[0] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.ACTIVE });

      expect(result.statusCode).to.equal(200);
    });

    it("again active customer  #1, by superadmin,  http code 422", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[0] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.ACTIVE });

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from admin", () => {
    it("inactive customer  #1, by admin,  http code 200", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[0] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.INACTIVE });

      expect(result.statusCode).to.equal(200);
    });

    it("active customer  #1, by admin,  http code 200", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[0] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.ACTIVE });

      expect(result.statusCode).to.equal(200);
    });

    it("again active customer  #1, by admin,  http code 422", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[0] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.ACTIVE });

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from teammember", () => {
    it("inactive customer, by teammember, not link company #1  http code 403", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[0] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.INACTIVE });

      expect(result.statusCode).to.equal(403);
    });

    it("inactive customer, by teammember, link company #2  http code 200", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[1] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.INACTIVE });

      expect(result.statusCode).to.equal(200);
    });

    it("active customer, by teammember,link company #2  http code 200", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[1] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.ACTIVE });

      expect(result.statusCode).to.equal(200);
    });

    it("again active customer, by teammember, link company #2  http code 422", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[1] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.ACTIVE });

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from customermember", () => {
    it("inactive customer, by customermember,  http code 403", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[0] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.INACTIVE });

      expect(result.statusCode).to.equal(403);
    });

    it("active customer, by teammember,  http code 403", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[0] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.ACTIVE });

      expect(result.statusCode).to.equal(403);
    });

    it("again active customer, by teammember,  http code 403", async () => {
      const result = await request(app)
        .patch("/customers/" + companyListIds[0] + "/status")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send({ status: ENUM_User_Status.ACTIVE });

      expect(result.statusCode).to.equal(403);
    });
  });
});
