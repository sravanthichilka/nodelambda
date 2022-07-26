const { default: AuthHelperController } = require("../src/app/auth/auth.helper");
const { ENUM_User_ROLE, ENUM_User_Status } = require("../src/helper/constants");

const commonPassword = "Birko@123";

const emailAndRole = [
  { role: ENUM_User_ROLE.CUSTOMER_USER, email: "customer@yopmail.com", password: commonPassword },
  {
    role: ENUM_User_ROLE.CUSTOMER_USER,
    email: "adithya.chenchugari@appitventures.com",
    password: commonPassword,
  },
  {
    role: ENUM_User_ROLE.CUSTOMER_USER,
    email: "deactive_customeruser@yopmail.com",
    password: commonPassword,
  },
];

exports.seed = async function (knex) {
  const userList = [];
  for (let recEmailAndRole of emailAndRole) {
    const test = new AuthHelperController();
    const salt = await test.createSalt();
    const hash = await test.createHash(salt, recEmailAndRole.email, recEmailAndRole.password);
    const aa = await test.hashCheck(
      { hash: hash, salt: salt },
      recEmailAndRole.email,
      recEmailAndRole.password
    );

    const user = {
      email: recEmailAndRole.email,
      firstName: "annapurna",
      lastName: "kenguva",
      phoneNumber: "8888888888",
      role: recEmailAndRole.role,
      status: ENUM_User_Status.ACTIVE,
      salt: salt,
      hash: hash,
      setTemporaryPassword: 0,
      CreatedAt: knex.raw("CURRENT_TIMESTAMP"),
      UpdatedAt: knex.raw("CURRENT_TIMESTAMP"),
    };

    if (recEmailAndRole.email === "deactive_customeruser@yopmail.com") {
      user.status = ENUM_User_Status.INACTIVE;
    }

    const [userId] = await knex("users").insert(user);
    const [companyId] = await knex("companies").insert({
      preS3KeyName: "appit_" + userId,
      companyName: "appit_" + userId,
      companyAddress: "appit_address_" + userId,
      uniqueId: "appit_uniqueId_" + userId,
      regionId: 1,
    });
    const [company_usersId] = await knex("company_users").insert({
      userId,
      companyId: companyId,
      isCompanyOwner: true,
    });
  }

  return Promise.resolve();
};
