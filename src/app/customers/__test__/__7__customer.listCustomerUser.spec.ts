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

const addCustomerUserData = {
  firstName: "ns",
  lastName: "ns",
  email: "new_cu1@yopmail.com",
  temporaryPassword: commonPassword,
};

let SUPERADMIN_ACCESS_TOKEN = "";
let ADMIN_ACCESS_TOKEN = "";
let TEAMMEMBER_ACCESS_TOKEN = "";
let CUSTOMER_USER_ACCESS_TOKEN = "";

describe("List Customer User Suit GET /customers/:companyId/users", () => {
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
    it("get customer user in company id #1 by superadmin, http code #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get("/customers/1/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("list customer user by filter[firstLastAndEmail] company id #1 by superadmin, http code #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail.com")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);

      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("list customer user by sortBy[lastName]=desc company id #1 by superadmin, http code #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?sortBy[lastName]=desc")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);

      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("send invalid data filter[firstLastAndEmail1] company id #1 by superadmin, http code #422", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?filter[firstLastAndEmail1]=yopmail.com")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(422);
    });

    it("list customer user by filter[firstLastAndEmail] company id #1 by superadmin with empty records, http code #200", async () => {
      const accessToken = SUPERADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail123.com")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(200);
      expect(result.body.data.records).to.be.eql([]);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });
  });

  describe("Logged in from admin", () => {
    it("get customer user in company id #1 by admin, http code #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      const result = await request(app)
        .get("/customers/1/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("list customer user by filter[firstLastAndEmail] company id #1 by admin, http code #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail.com")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);

      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("list customer user by sortBy[lastName]=desc company id #1 by admin, http code #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?sortBy[lastName]=desc")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(200);

      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });

    it("send invalid data filter[firstLastAndEmail1] company id #1 by admin, http code #422", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?filter[firstLastAndEmail1]=yopmail.com")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(422);
    });

    it("list customer user by filter[firstLastAndEmail] company id #1 by admin with empty records, http code #200", async () => {
      const accessToken = ADMIN_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail123.com")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(200);
      expect(result.body.data.records).to.be.eql([]);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });
  });

  describe("Logged in from teammember", () => {
    it("get customer user in company id #1 by teammember, not link, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      const result = await request(app)
        .get("/customers/1/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("list customer user by filter[firstLastAndEmail] company id #1, not link by teammember, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail.com")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("list customer user by sortBy[lastName]=desc company id #1 by teammember, http code #403", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?sortBy[lastName]=desc")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("send invalid data filter[firstLastAndEmail1] company id #1 by teammember, http code #422", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?filter[firstLastAndEmail1]=yopmail.com")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(422);
    });

    it("list customer user by filter[firstLastAndEmail] company id #2 by teammember with empty records, http code #200", async () => {
      const accessToken = TEAMMEMBER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/2/users?filter[firstLastAndEmail]=@yopmail123.com")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(200);
      expect(result.body.data.records).to.be.eql([]);
      expect(result.body.data).to.have.property("records");
      expect(result.body.data).to.have.property("recordsMetaData");
    });
  });

  describe("Logged in from customuser", () => {
    it("get customer user in company id #1 by customuser, not link, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      const result = await request(app)
        .get("/customers/1/users")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("list customer user by filter[firstLastAndEmail] company id #1 by customeruser, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail.com")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("list customer user by sortBy[lastName]=desc company id #1 by customer user, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?sortBy[lastName]=desc")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);

      expect(result.statusCode).to.equal(403);
    });

    it("send invalid data filter[firstLastAndEmail1] company id #1 by customeruser, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?filter[firstLastAndEmail1]=yopmail.com")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(403);
    });

    it("list customer user by filter[firstLastAndEmail] company id #1 by customeruser with empty records, http code #403", async () => {
      const accessToken = CUSTOMER_USER_ACCESS_TOKEN;

      let addCustomerUserDataCopy: any = { ...addCustomerUserData };
      addCustomerUserDataCopy.email = "new_cu1@yopmail.com";
      addCustomerUserDataCopy.lastName = "new_cu1";

      const result = await request(app)
        .get("/customers/1/users?filter[firstLastAndEmail]=@yopmail123.com")
        .set("user-agent", "mocha")
        .set("Authorization", accessToken);
      expect(result.statusCode).to.equal(403);
    });
  });
});
