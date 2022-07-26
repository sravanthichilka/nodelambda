import app from "../../../main";
import request from "supertest";

import { expect } from "chai";
import { ENUM_User_ROLE } from "../../../helper/constants";
import {
  commonPassword,
  roleLoginCredentails,
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

describe("Users Suit (POST /users)", () => {
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
        .get("/users")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
      expect(result.body.data.recordsMetaData).to.have.property("recordPerPage");
      expect(result.body.data.recordsMetaData).to.have.property("currentPage");
      expect(result.body.data.recordsMetaData).to.have.property("totalPages");
      expect(result.body.data.recordsMetaData).to.have.property("totalRecords");
    });

    it("Correct credentails, superadmin@yopmail.com, querystring ?recordPerPage=20 httpcode #200", async () => {
      const result = await request(app)
        .get("/users?recordPerPage=20")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
      expect(result.body.data.recordsMetaData).to.have.property("recordPerPage");
      expect(result.body.data.recordsMetaData).to.have.property("currentPage");
      expect(result.body.data.recordsMetaData).to.have.property("totalPages");
      expect(result.body.data.recordsMetaData).to.have.property("totalRecords");
    });

    it("Correct credentails, superadmin@yopmail.com, querystring ?sortBy[firstName]=asc httpcode #200", async () => {
      const result = await request(app)
        .get("/users?sortBy[firstName]=asc")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
      expect(result.body.data.recordsMetaData).to.have.property("recordPerPage");
      expect(result.body.data.recordsMetaData).to.have.property("currentPage");
      expect(result.body.data.recordsMetaData).to.have.property("totalPages");
      expect(result.body.data.recordsMetaData).to.have.property("totalRecords");
    });

    it("Correct credentails, superadmin@yopmail.com, querystring ?filter[firstLastAndEmail]=@yopmail.com httpcode #200", async () => {
      const result = await request(app)
        .get("/users?filter[firstLastAndEmail]=@yopmail.com")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
      expect(result.body.data.recordsMetaData).to.have.property("recordPerPage");
      expect(result.body.data.recordsMetaData).to.have.property("currentPage");
      expect(result.body.data.recordsMetaData).to.have.property("totalPages");
      expect(result.body.data.recordsMetaData).to.have.property("totalRecords");
    });

    it("send invalid field, invalidfield, httpcode #422", async () => {
      const result = await request(app)
        .get("/users?invalidfield=1")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from admin", () => {
    it("Correct credentails, admin@yopmail.com, httpcode #200", async () => {
      const result = await request(app)
        .get("/users")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
      expect(result.body.data.recordsMetaData).to.have.property("recordPerPage");
      expect(result.body.data.recordsMetaData).to.have.property("currentPage");
      expect(result.body.data.recordsMetaData).to.have.property("totalPages");
      expect(result.body.data.recordsMetaData).to.have.property("totalRecords");
    });

    it("Correct credentails, admin@yopmail.com, querystring ?recordPerPage=20 httpcode #200", async () => {
      const result = await request(app)
        .get("/users?recordPerPage=20")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
      expect(result.body.data.recordsMetaData).to.have.property("recordPerPage");
      expect(result.body.data.recordsMetaData).to.have.property("currentPage");
      expect(result.body.data.recordsMetaData).to.have.property("totalPages");
      expect(result.body.data.recordsMetaData).to.have.property("totalRecords");
    });

    it("Correct credentails, admin@yopmail.com, querystring ?sortBy[firstName]=asc httpcode #200", async () => {
      const result = await request(app)
        .get("/users?sortBy[firstName]=asc")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
      expect(result.body.data.recordsMetaData).to.have.property("recordPerPage");
      expect(result.body.data.recordsMetaData).to.have.property("currentPage");
      expect(result.body.data.recordsMetaData).to.have.property("totalPages");
      expect(result.body.data.recordsMetaData).to.have.property("totalRecords");
    });

    it("Correct credentails, admin@yopmail.com, querystring ?filter[firstLastAndEmail]=@yopmail.com httpcode #200", async () => {
      const result = await request(app)
        .get("/users?filter[firstLastAndEmail]=@yopmail.com")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
      expect(result.body.data.recordsMetaData).to.have.property("recordPerPage");
      expect(result.body.data.recordsMetaData).to.have.property("currentPage");
      expect(result.body.data.recordsMetaData).to.have.property("totalPages");
      expect(result.body.data.recordsMetaData).to.have.property("totalRecords");
    });

    it("send invalid field, invalidfield, httpcode #422", async () => {
      const result = await request(app)
        .get("/users?invalidfield=1")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from teammember", () => {
    it("Correct credentails, teammember@yopmail.com, httpcode #403", async () => {
      const result = await request(app)
        .get("/users")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("Correct credentails, teammember@yopmail.com, querystring ?recordPerPage=20 httpcode #403", async () => {
      const result = await request(app)
        .get("/users?recordPerPage=20")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("Correct credentails, teammember@yopmail.com, querystring ?sortBy[firstName]=asc httpcode #403", async () => {
      const result = await request(app)
        .get("/users?sortBy[firstName]=asc")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("Correct credentails, teammember@yopmail.com, querystring ?filter[firstLastAndEmail]=@yopmail.com httpcode #403", async () => {
      const result = await request(app)
        .get("/users?filter[firstLastAndEmail]=@yopmail.com")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("send invalid field, invalidfield, httpcode #422", async () => {
      const result = await request(app)
        .get("/users?invalidfield=1")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from customer", () => {
    it("Correct credentails, customer@yopmail.com, httpcode #403", async () => {
      const result = await request(app)
        .get("/users")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("Correct credentails, customer@yopmail.com, querystring ?recordPerPage=20 httpcode #403", async () => {
      const result = await request(app)
        .get("/users?recordPerPage=20")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("Correct credentails, customer@yopmail.com, querystring ?sortBy[firstName]=asc httpcode #403", async () => {
      const result = await request(app)
        .get("/users?sortBy[firstName]=asc")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("Correct credentails, customer@yopmail.com, querystring ?filter[firstLastAndEmail]=@yopmail.com httpcode #403", async () => {
      const result = await request(app)
        .get("/users?filter[firstLastAndEmail]=@yopmail.com")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("send invalid field, invalidfield, httpcode #422", async () => {
      const result = await request(app)
        .get("/users?invalidfield=1")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

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
