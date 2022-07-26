import app from "../../../../main";
import request from "supertest";

import { expect } from "chai";

import { ENUM_User_ROLE, ENUM_User_Status } from "../../../../helper/constants";
import {
  commonPassword,
  roleLoginCredentails,
  getLoginDataFn,
  getUserIdsFromCompanyFn,
} from "../../../customers/__test__/helper";

let SUPERADMIN_REFRESH_ACCESS_TOKEN = "";
let ADMIN_REFRESH_ACCESS_TOKEN = "";
let TEAMMEMBER_REFRESH_ACCESS_TOKEN = "";
let CUSTOMER_USER_REFRESH_ACCESS_TOKEN = "";

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";

const editProfile = {
  firstName: "Super Admin",
  lastName: "supera",
  phoneNumber: "5434567897",
};

describe("User Suit (POST /user/profile)", () => {
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
    it("Correct credentails, superadmin@yopmail.com, httpcode #200", async () => {
      const result = await request(app)
        .get("/user/me")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
    });

    it("dont send field, superadmin@yopmail.com, httpcode #422", async () => {
      const updateProfile = { ...editProfile };
      updateProfile.firstName = "superadmin_firstname";

      const result = await request(app)
        .get("/user/me?3=1")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from admin", () => {
    it("Correct credentails, admin@yopmail.com, httpcode #200", async () => {
      const result = await request(app)
        .get("/user/me")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
    });

    it("dont send field, admin@yopmail.com, httpcode #422", async () => {
      const result = await request(app)
        .get("/user/me?3=1")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from teammember", () => {
    it("Correct credentails, teammember@yopmail.com, httpcode #200", async () => {
      const result = await request(app)
        .get("/user/me")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
    });

    it("dont send field, teammember@yopmail.com, httpcode #422", async () => {
      const result = await request(app)
        .get("/user/me?3=1")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from customeruser", () => {
    it("Correct credentails, customer@yopmail.com, httpcode #200", async () => {
      const result = await request(app)
        .get("/user/me")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
    });

    it("dont send field, teammember@yopmail.com, httpcode #422", async () => {
      const result = await request(app)
        .get("/user/me?3=1")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("CROSS:IN: Logged in from admin, update superadmin record", () => {
    it("admin ->  superadmin , httpcode #403", async () => {});
  });

  describe("CROSS:IN: Logged in from teammember, update admin record", () => {
    it("teammember ->  admin , httpcode #403", async () => {});
  });

  describe("CROSS:IN: Logged in from customer, update teammember record", () => {
    it("customer ->  teammember , httpcode #403", async () => {});
  });
});
