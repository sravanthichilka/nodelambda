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

let SUPERADMIN_REFRESH_ACCESS_TOKEN = "";
let ADMIN_REFRESH_ACCESS_TOKEN = "";
let TEAMMEMBER_REFRESH_ACCESS_TOKEN = "";
let CUSTOMER_USER_REFRESH_ACCESS_TOKEN = "";

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";

const addCustomerData = {
  customerUser: {
    firstName: "test",
    lastName: "test",
    email: "tes11t12221@gmail.com",
    temporaryPassword: "test",
    regionId: 2,
  },
  companyInfo: {
    companyName: "test222111",
    companyAddress: "test",
    uniqueId: "test11221",
  },
  assignedTeamMember: [1],
};

describe("Customer Suit (GET /customers) ", () => {
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
    it("customer list, superadmin, httpcode #200", async () => {
      const result = await request(app)
        .get("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("filter customer list by company name or uniqueId, superadmin, httpcode #200", async () => {
      const result = await request(app)
        .get("/customers?filter[firstLastAndUnique]=" + "cnamesuperadmin")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("invalid filter firstLastAndUnique  sending customer list, superadmin, httpcode #422", async () => {
      const result = await request(app)
        .get("/customers?filter[firstLastAndUnique12]=" + "cnamesuperadmin")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });

    it("filter customer list by regionId, superadmin, httpcode #200", async () => {
      const result = await request(app)
        .get("/customers?filter[regionId]=" + 2)
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("invalid filter regionId  sending customer list, superadmin, httpcode #422", async () => {
      const result = await request(app)
        .get("/customers?filter[regionId1]=" + 2)
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });

    //Sort by: Company Name, Unique ID, First Name, Last Name, Email, Status.
    // "companyName", "uniqueId", "firstName","lastName","email", "status"
    it("sort customer list superadmin, httpcode #200", async () => {
      const result = await request(app)
        .get("/customers?sortBy[companyName]=asc")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("invalid sort companyName1 customer list superadmin, httpcode #422", async () => {
      const result = await request(app)
        .get("/customers?sortBy[companyName1]=asc")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from admin", () => {
    it("customer list, admin, httpcode #200", async () => {
      const result = await request(app)
        .get("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("filter customer list by company name or uniqueId, admin, httpcode #200", async () => {
      const result = await request(app)
        .get("/customers?filter[firstLastAndUnique]=" + "cnameadmin")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("invalid filter firstLastAndUnique  sending customer list, httpcode #422", async () => {
      const result = await request(app)
        .get("/customers?filter[firstLastAndUnique12]=" + "cnamesuperadmin")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });

    it("filter customer list by regionId, httpcode #200", async () => {
      const result = await request(app)
        .get("/customers?filter[regionId]=" + 2)
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("invalid filter regionId  sending customer list, httpcode #422", async () => {
      const result = await request(app)
        .get("/customers?filter[regionId1]=" + 2)
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });

    //Sort by: Company Name, Unique ID, First Name, Last Name, Email, Status.
    // "companyName", "uniqueId", "firstName","lastName","email", "status"
    it("sort customer list, httpcode #200", async () => {
      const result = await request(app)
        .get("/customers?sortBy[companyName]=asc")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("invalid sort companyName1 customer list, httpcode #422", async () => {
      const result = await request(app)
        .get("/customers?sortBy[companyName1]=asc")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from teammember", () => {
    it("customer list, httpcode #200", async () => {
      const result = await request(app)
        .get("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("filter customer list by company name or uniqueId, httpcode #200", async () => {
      const result = await request(app)
        .get("/customers?filter[firstLastAndUnique]=" + "cnameadmin")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("invalid filter firstLastAndUnique  sending customer list, httpcode #422", async () => {
      const result = await request(app)
        .get("/customers?filter[firstLastAndUnique12]=" + "cnamesuperadmin")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });

    it("filter customer list by regionId, httpcode #200", async () => {
      const result = await request(app)
        .get("/customers?filter[regionId]=" + 2)
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("invalid filter regionId  sending customer list, httpcode #422", async () => {
      const result = await request(app)
        .get("/customers?filter[regionId1]=" + 2)
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });

    //Sort by: Company Name, Unique ID, First Name, Last Name, Email, Status.
    // "companyName", "uniqueId", "firstName","lastName","email", "status"
    it("sort customer list, httpcode #200", async () => {
      const result = await request(app)
        .get("/customers?sortBy[companyName]=asc")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("invalid sort companyName1 customer list, httpcode #422", async () => {
      const result = await request(app)
        .get("/customers?sortBy[companyName1]=asc")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from customer", () => {
    it("customer list, httpcode #403", async () => {
      const result = await request(app)
        .get("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("filter customer list by company name or uniqueId, httpcode #403", async () => {
      const result = await request(app)
        .get("/customers?filter[firstLastAndUnique]=" + "cnameadmin")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("invalid filter firstLastAndUnique  sending customer list, httpcode #403", async () => {
      const result = await request(app)
        .get("/customers?filter[firstLastAndUnique12]=" + "cnamesuperadmin")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("filter customer list by regionId, httpcode #403", async () => {
      const result = await request(app)
        .get("/customers?filter[regionId]=" + 2)
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("invalid filter regionId  sending customer list, httpcode #403", async () => {
      const result = await request(app)
        .get("/customers?filter[regionId1]=" + 2)
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    //Sort by: Company Name, Unique ID, First Name, Last Name, Email, Status.
    // "companyName", "uniqueId", "firstName","lastName","email", "status"
    it("sort customer list, httpcode #403", async () => {
      const result = await request(app)
        .get("/customers?sortBy[companyName]=asc")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });

    it("invalid sort companyName1 customer list, httpcode #403", async () => {
      const result = await request(app)
        .get("/customers?sortBy[companyName1]=asc")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN);

      expect(result.statusCode).to.equal(403);
    });
  });
});
