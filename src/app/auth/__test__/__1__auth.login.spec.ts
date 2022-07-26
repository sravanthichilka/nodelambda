import app from "../../../main";
import request from "supertest";

import { expect } from "chai";
import { ENUM_User_ROLE } from "../../../helper/constants";
import {
  commonPassword,
  roleLoginCredentails,
  getLoginAccessTokenFn,
  getUserIdsFromCompanyFn,
} from "../../customers/__test__/helper";

describe("Auth Suit (POST /auth/login)", () => {
  describe("Logged in from Superadmin", () => {
    it("Correct credentails, superadmin@yopmail.com, httpcode #200", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(roleLoginCredentails.superAdmin.credentails);

      expect(result.statusCode).to.equal(200);
      expect(result.body.data).to.have.property("accessToken");
      expect(result.body.data).to.have.property("refreshToken");
      expect(result.body.data).to.have.property("user");
      expect(result.body.data.user.role).to.equal(ENUM_User_ROLE.SUPERADMIN);
    });

    it("Correct credentails , httpcode #200", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(roleLoginCredentails.superAdmin.credentails);

      expect(result.body.data).to.have.property("accessToken");
      expect(result.body.data).to.have.property("refreshToken");
      expect(result.body.data).to.have.property("user");
      expect(result.body.data.user.role).to.equal(ENUM_User_ROLE.SUPERADMIN);
      expect(result.statusCode).to.equal(200);
    });

    it("login with de-active user - Superadmin -- httpcode: #403", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(roleLoginCredentails.deactiveSuperadmin.credentails);

      expect(result.body.message).to.equal(
        "Your account is deactivated, please contact super admin."
      );
      expect(result.statusCode).to.equal(403);
    });

    it("email field not send - httpcode #422", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send({ password: "sdfsadf" });
      expect(result.statusCode).to.equal(422);
    });

    it("password field not send - httpcode #422", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send({ email: "sdfsadf" });
      expect(result.statusCode).to.equal(422);
    });

    it("In-correct credentails - httpcode #401", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send({ email: "testing@hello.com", password: "sdfsadf" });
      expect(result.statusCode).to.equal(401);
    });

    it("In-correct credentails if email address exist in db - httpcode #401", async () => {
      const updateDate = { ...roleLoginCredentails.superAdmin.credentails };
      updateDate.password = "sdfsadf";

      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(updateDate);
      expect(result.statusCode).to.equal(401);
    });

    it("settemporarypassword user try to login - Superadmin -- httpcode: #200", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(roleLoginCredentails.settemporarypasswordSuperadmin.credentails);

      expect(result.body.data).to.have.property("accessToken");
      expect(result.body.data).to.have.property("refreshToken");
      expect(result.body.data).to.have.property("user");
      expect(result.body.data.user.setTemporaryPassword).to.equal(1);
      expect(result.statusCode).to.equal(200);
    });
  });

  describe("Logged in from admin", () => {
    it("Correct credentails, httpcode #200", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(roleLoginCredentails.admin.credentails);

      expect(result.body.data).to.have.property("accessToken");
      expect(result.body.data).to.have.property("refreshToken");
      expect(result.body.data).to.have.property("user");
      expect(result.body.data.user.role).to.equal(ENUM_User_ROLE.ADMIN);
      expect(result.statusCode).to.equal(200);
    });

    it("login with de-active user - admin -- httpcode: #403", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(roleLoginCredentails.deactiveAdmin.credentails);

      expect(result.body.message).to.equal(
        "Your account is deactivated, please contact super admin."
      );
      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from teammember", () => {
    it("Correct credentails, httpcode #200", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(roleLoginCredentails.teamMember.credentails);

      expect(result.body.data).to.have.property("accessToken");
      expect(result.body.data).to.have.property("refreshToken");
      expect(result.body.data).to.have.property("user");
      expect(result.body.data.user.role).to.equal(ENUM_User_ROLE.TEAM_MEMBER);
      expect(result.statusCode).to.equal(200);
    });

    it("login with de-active user - admin -- httpcode: #403", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(roleLoginCredentails.deactiveTeamMember.credentails);

      expect(result.body.message).to.equal(
        "Your account is deactivated, please contact super admin."
      );
      expect(result.statusCode).to.equal(403);
    });
  });

  describe("Logged in from customer", () => {
    it("Correct credentails, httpcode #200", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(roleLoginCredentails.customer.credentails);

      expect(result.body.data).to.have.property("accessToken");
      expect(result.body.data).to.have.property("refreshToken");
      expect(result.body.data).to.have.property("user");
      expect(result.body.data.user.role).to.equal(ENUM_User_ROLE.CUSTOMER_USER);
      expect(result.statusCode).to.equal(200);
    });

    it("login with de-active user- httpcode: #403", async () => {
      const result = await request(app)
        .post("/auth/login")
        .set("user-agent", "mocha")
        .send(roleLoginCredentails.deactiveCustomerUser.credentails);

      expect(result.body.message).to.equal(
        "Your account is deactivated, please contact super admin."
      );
      expect(result.statusCode).to.equal(403);
    });
  });
});
