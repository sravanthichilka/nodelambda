import app from "../../../main";
import request from "supertest";

import { expect } from "chai";
import { ENUM_User_ROLE, ENUM_User_Status } from "../../../helper/constants";
import {
  commonPassword,
  roleLoginCredentails,
  getTeamUserIdsFn,
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
  },
  companyInfo: {
    companyName: "test222111",
    companyAddress: "test",
    uniqueId: "test11221",
    regionId: 2,
  },
  assignedTeamMember: [1],
};

const pri_add_custuser_s = "pri_add_custuser_s@yopmail.com";
const pri_add_custuser_deactive_s = "pri_add_custuser_deactive_s@yopmail.com";
const pri_add_custuser_s_assignedtm = "pri_add_custuser_s_assignedtm@yopmail.com";
const pri_add_custuser_a = "pri_add_custuser_a@yopmail.com";
const pri_custuser_add_deactive_a = "pri_custuser_add_deactive_a@yopmail.com";
const pri_add_custuser__assignedtm = "pri_add_custuser__assignedtm@yopmail.com";
const pri_add_custuser_t = "pri_add_custuser_t@yopmail.com";
const pri_custuser_add_deactive_t = "pri_custuser_add_deactive_t@yopmail.com";

let teamUserIds: number[] = [];

function beforeAtSymbol(str: string) {
  return str.substring(0, str.search("@"));
}

//   pri_add_custuser_s@yopmail.com
// pri_add_custuser_deactive_s@yopmail.com
//pri_add_custuser_s_assignedtm@yopmail.com
// pri_add_custuser_a@yopmail.com
//pri_custuser_add_deactive_a@yopmail.com
//pri_add_custuser__assignedtm@yopmail.com

//pri_add_custuser_t@yopmail.com
//pri_custuser_add_deactive_t@yopmail.com

describe("Customer Suit (POST /customers) ", () => {
  before(async function () {
    const superAdmin = await getLoginDataFn(roleLoginCredentails.superAdmin.credentails);
    SUPERADMIN_ACCESS_TOKEN = superAdmin.accessToken;
    SUPERADMIN_REFRESH_ACCESS_TOKEN = superAdmin.refreshToken;

    teamUserIds = await getTeamUserIdsFn(SUPERADMIN_ACCESS_TOKEN);

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
    it("add customer, email pri_add_custuser_s, invalid assignedteammember ids, httpcode #409 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = pri_add_custuser_s;
      addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_s);
      addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_s);
      addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(409);
    });

    it("add customer, pri_add_custuser_s@yopmail.com, httpcode #201 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = pri_add_custuser_s;
      addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_s);
      addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_s);
      addCustomerDataCopy.assignedTeamMember = [];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(201);
      expect(result.body.data).to.have.property("id");
    });

    it("add customer with same email, pri_add_custuser_s@yopmail.com httpcode #409 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = pri_add_custuser_s;
      addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_s);
      addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_s);
      addCustomerDataCopy.assignedTeamMember = [];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(409);
    });

    it("customerUser is not sending, httpcode #422 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      delete addCustomerDataCopy.customerUser;

      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(422);
    });

    it("add customer, pri_add_custuser_deactive_s@yopmail.com customer, httpcode 201 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = pri_add_custuser_deactive_s;
      addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_deactive_s);
      addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_deactive_s);
      addCustomerDataCopy.assignedTeamMember = [];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(201);
      expect(result.body.data).to.have.property("id");
    });

    it("not send companyInfo is not sending, httpcode #422 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      delete addCustomerDataCopy.companyInfo;

      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(422);
    });

    it("add customer by superadmin with assignedTeamMember, httpcode 201 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };

      addCustomerDataCopy.assignedTeamMember = teamUserIds;

      addCustomerDataCopy.customerUser.email = pri_add_custuser_s_assignedtm;
      addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_s_assignedtm);
      addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_s_assignedtm);

      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", SUPERADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(201);
      expect(result.body.data).to.have.property("id");
    });
  });

  describe("Logged in from admin", () => {
    it("add customer, invalid assignedteammember ids, httpcode #409 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = "pri_add_custuser_a@yopmail.com";
      addCustomerDataCopy.companyInfo.companyName = "customeruser_admin";
      addCustomerDataCopy.companyInfo.uniqueId = "customeruseradmin";
      addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(409);
    });

    it("add customer, pri_add_custuser_a@yopmail.com, httpcode #201 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = pri_add_custuser_a;
      addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_a);
      addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_a);
      addCustomerDataCopy.assignedTeamMember = [];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(201);
      expect(result.body.data).to.have.property("id");
    });

    it("add customer with same email, pri_add_custuser_a@yopmail.com httpcode #409 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = "pri_add_custuser_a@yopmail.com";
      addCustomerDataCopy.companyInfo.companyName = "customeruser_superadmin";
      addCustomerDataCopy.companyInfo.uniqueId = "customerusersuperadmin";
      addCustomerDataCopy.assignedTeamMember = [];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(409);
    });

    it("customerUser is not sending, httpcode #422 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      delete addCustomerDataCopy.customerUser;

      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(422);
    });

    it("add customer, pri_custuser_add_deactive_a@yopmail.com customer, httpcode #201 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = pri_custuser_add_deactive_a;
      addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_custuser_add_deactive_a);
      addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_custuser_add_deactive_a);
      addCustomerDataCopy.assignedTeamMember = [];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(201);
      expect(result.body.data).to.have.property("id");
    });

    it("not send companyInfo is not sending, httpcode #422 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      delete addCustomerDataCopy.companyInfo;

      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(422);
    });

    it("add customer by admin with assignedTeamMember, httpcode 201 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };

      addCustomerDataCopy.assignedTeamMember = teamUserIds;

      addCustomerDataCopy.customerUser.email = pri_add_custuser__assignedtm;
      addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser__assignedtm);
      addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser__assignedtm);

      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", ADMIN_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(201);
      expect(result.body.data).to.have.property("id");
    });
  });

  describe("Logged in from teammember", () => {
    it("add customer, invalid assignedteammember ids, httpcode #201 ", async () => {
      // it will overwrite its own ID
    });

    it("add customer, pri_add_custuser_t@yopmail.com, httpcode #201 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = pri_add_custuser_t;
      addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_add_custuser_t);
      addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_add_custuser_t);
      addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(201);
      expect(result.body.data).to.have.property("id");
    });

    it("same add customer, pri_add_custuser_t@yopmail.com, httpcode #409 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = "pri_add_custuser_t@yopmail.com";
      addCustomerDataCopy.companyInfo.companyName = "pri_add_custuser_t";
      addCustomerDataCopy.companyInfo.uniqueId = "pri_add_custuser_t";
      addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(409);
    });

    it("customerUser is not sending, httpcode #422 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      delete addCustomerDataCopy.customerUser;

      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(422);
    });

    it("add customer, pri_custuser_add_deactive_t@yopmail.com customer, httpcode #201 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = pri_custuser_add_deactive_t;
      addCustomerDataCopy.companyInfo.companyName = beforeAtSymbol(pri_custuser_add_deactive_t);
      addCustomerDataCopy.companyInfo.uniqueId = beforeAtSymbol(pri_custuser_add_deactive_t);
      addCustomerDataCopy.assignedTeamMember = [];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(201);
      expect(result.body.data).to.have.property("id");
    });

    it("not send companyInfo is not sending, httpcode #422 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      delete addCustomerDataCopy.companyInfo;

      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", TEAMMEMBER_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(422);
    });
  });

  describe("Logged in from customer", () => {
    it("add customer, primary_customeruser_customer@yopmail.com, httpcode #403 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = "primary_customeruser_customer@yopmail.com";
      addCustomerDataCopy.companyInfo.companyName = "primary_customeruser_customer";
      addCustomerDataCopy.companyInfo.uniqueId = "primary_customeruser_customer";
      addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(403);
    });

    it("same add customer, primary_customeruser_customer@yopmail.com, httpcode #403 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = "primary_customeruser_customer@yopmail.com";
      addCustomerDataCopy.companyInfo.companyName = "primary_customeruser_customer";
      addCustomerDataCopy.companyInfo.uniqueId = "primary_customeruser_customer";
      addCustomerDataCopy.assignedTeamMember = [1, 2, 3, 4, 5];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(403);
    });

    it("customerUser is not sending, httpcode #403 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      delete addCustomerDataCopy.customerUser;

      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(403);
    });

    it("add customer, customeruser_deactive_customer@yopmail.com customer, httpcode #403 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      addCustomerDataCopy.customerUser.email = "customeruser_deactive_customer@yopmail.com";
      addCustomerDataCopy.companyInfo.companyName = "customeruser_deactive_customer";
      addCustomerDataCopy.companyInfo.uniqueId = "customeruser_deactive_customer";
      addCustomerDataCopy.assignedTeamMember = [];
      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(403);
    });

    it("not send companyInfo is not sending, httpcode #403 ", async () => {
      let addCustomerDataCopy: any = { ...addCustomerData };
      delete addCustomerDataCopy.companyInfo;

      const result = await request(app)
        .post("/customers")
        .set("user-agent", "mocha")
        .set("Authorization", CUSTOMER_USER_ACCESS_TOKEN)
        .send(addCustomerDataCopy);

      expect(result.statusCode).to.equal(403);
    });
  });
});
