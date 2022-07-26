import app from "../../../main";
import request from "supertest";

import { expect } from "chai";
import { ENUM_User_ROLE, ENUM_User_Status } from "../../../helper/constants";
import {
  commonPassword,
  roleLoginCredentails,
  addCustomerUser,
  getLoginDataFn,
  getUserIdsFromCompanyFn,
} from "../../customers/__test__/helper";

let SUPERADMIN_REFRESH_ACCESS_TOKEN = "";
let ADMIN_REFRESH_ACCESS_TOKEN = "";
let TEAMMEMBER_REFRESH_ACCESS_TOKEN = "";
let CUSTOMER_USER_REFRESH_ACCESS_TOKEN = "";

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN_OTHER = "";
let CUSTOMER_USER_REFRESH_ACCESS_TOKEN_OTHER = "";

describe("Customer Suit (GET /customers/:companyId)", () => {
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

    const customeruserOther = await getLoginDataFn(addCustomerUser.addBySuperAdmin.credentails);
    CUSTOMER_USER_ACCESS_TOKEN_OTHER = customeruserOther.accessToken;
    CUSTOMER_USER_REFRESH_ACCESS_TOKEN_OTHER = customeruserOther.refreshToken;
  });

  describe("Logged in from Superadmin", () => {
    it("accessing by superadmin role,  httpcode 200", async () => {
      const result = await request(app)
        .get("/customers/1")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("customerUser");
      expect(result.body.data).to.have.property("companyInfo");
      expect(result.body.data).to.have.property("assignedTeamMember");
    });

    it("sending wrong companyId by superadmin role,  httpcode 422", async () => {
      const result = await request(app)
        .get("/customers/1122")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from admin", () => {
    it("accessing by role,  httpcode 200", async () => {
      const result = await request(app)
        .get("/customers/1")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("customerUser");
      expect(result.body.data).to.have.property("companyInfo");
      expect(result.body.data).to.have.property("assignedTeamMember");
    });

    it("sending wrong companyId by role,  httpcode 422", async () => {
      const result = await request(app)
        .get("/customers/1122")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from teammember", () => {
    it("accessing by  teammember customer #1,  httpcode 403", async () => {
      const result = await request(app)
        .get("/customers/1")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("accessing by teammember customer #9,  httpcode 200", async () => {
      const result = await request(app)
        .get("/customers/9")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("customerUser");
      expect(result.body.data).to.have.property("companyInfo");
      expect(result.body.data).to.have.property("assignedTeamMember");
    });

    it("sending wrong companyId by role,  httpcode 422", async () => {
      const result = await request(app)
        .get("/customers/1122")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from customer", () => {
    it("accessing by role,  httpcode 200", async () => {
      const result = await request(app)
        .get("/customers/1")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("customerUser");
      expect(result.body.data).to.have.property("companyInfo");
      expect(result.body.data).to.have.property("assignedTeamMember");
    });

    it("accessing by customer user to company #1 role,  httpcode 403", async () => {
      const result = await request(app)
        .get("/customers/1")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN_OTHER);

      expect(result.statusCode).to.equal(403);
    });

    it("sending wrong companyId by role,  httpcode 422", async () => {
      const result = await request(app)
        .get("/customers/1122")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });
});
