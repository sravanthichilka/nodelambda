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
import MESSAGE_ENUM from "../../../helper/message";

let SUPERADMIN_REFRESH_ACCESS_TOKEN = "";
let ADMIN_REFRESH_ACCESS_TOKEN = "";
let TEAMMEMBER_REFRESH_ACCESS_TOKEN = "";
let CUSTOMER_USER_REFRESH_ACCESS_TOKEN = "";

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";

const updateUserStatus = {
  setTemporaryPassword: commonPassword,
};

describe("Team member  (GET /teammembers/fetch)", () => {
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
    it("Correct credentails - Superadmin, no header send, httpcode #422", async () => {
      const result = await request(app)
        .get("/teammembers/fetch")
        .set("user-agent", "mocha")
        .send(roleLoginCredentails.superAdmin.credentails);

      expect(result.statusCode).to.equal(422);
      expect(result.body.message).to.equal(MESSAGE_ENUM.AUTHORIZATION_REQUIRED);
    });

    it("Correct credentails - Superadmin, header send , httpcode #200", async () => {
      const result = await request(app)
        .get("/teammembers/fetch")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
    });

    it("filter[firstLastAndEmail] send, header send, httpcode #200 ", async () => {
      const result = await request(app)
        .get(
          "/teammembers/fetch?filter[firstLastAndEmail]=" +
            roleLoginCredentails.teamMember.credentails.email
        )
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.body.data).to.have.property("records");
      expect(result.body.data.records[0]).to.have.property("id");
      expect(result.statusCode).to.equal(200);
    });

    it("invalide filter[firstLastAndEmail1] send, header send, httpcode #422 ", async () => {
      const result = await request(app)
        .get(
          "/teammembers/fetch?filter[firstLastAndEmail1]=" +
            roleLoginCredentails.teamMember.credentails.email
        )
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from admin", () => {
    it("Correct credentails, no header send, httpcode #422", async () => {
      const result = await request(app)
        .get("/teammembers/fetch")
        .set("user-agent", "mocha")
        .send(roleLoginCredentails.admin.credentails);

      expect(result.statusCode).to.equal(422);
      expect(result.body.message).to.equal(MESSAGE_ENUM.AUTHORIZATION_REQUIRED);
    });

    it("Correct credentails, header send , httpcode #200", async () => {
      const result = await request(app)
        .get("/teammembers/fetch")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
    });

    it("filter[firstLastAndEmail] send, header send, httpcode #200 ", async () => {
      const result = await request(app)
        .get(
          "/teammembers/fetch?filter[firstLastAndEmail]=" +
            roleLoginCredentails.teamMember.credentails.email
        )
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.body.data).to.have.property("records");
      expect(result.body.data.records[0]).to.have.property("id");
      expect(result.statusCode).to.equal(200);
    });

    it("invalide filter[firstLastAndEmail1] send, header send, httpcode #422 ", async () => {
      const result = await request(app)
        .get(
          "/teammembers/fetch?filter[firstLastAndEmail1]=" +
            roleLoginCredentails.teamMember.credentails.email
        )
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from teammember", () => {
    it("Correct credentails, header send , httpcode #403", async () => {
      const result = await request(app)
        .get("/teammembers/fetch")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("filter[firstLastAndEmail] send, header send, httpcode #403 ", async () => {
      const result = await request(app)
        .get(
          "/teammembers/fetch?filter[firstLastAndEmail]=" +
            roleLoginCredentails.teamMember.credentails.email
        )
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from customer", () => {
    it("Correct credentails, header send , httpcode #403", async () => {
      const result = await request(app)
        .get("/teammembers/fetch")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("filter[firstLastAndEmail] send, header send, httpcode #403 ", async () => {
      const result = await request(app)
        .get(
          "/teammembers/fetch?filter[firstLastAndEmail]=" +
            roleLoginCredentails.teamMember.credentails.email
        )
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });
  });
});
