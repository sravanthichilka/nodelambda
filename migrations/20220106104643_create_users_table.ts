import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", function (table) {
    table.increments("id").notNullable();
    table.string("email", 300).notNullable().unique();
    table.string("firstName", 150).notNullable();
    table.string("lastName", 150).nullable();
    table.string("phoneNumber", 15).nullable();
    table
      .integer("resetPassword")
      .defaultTo(0)
      .notNullable()
      .comment("0: no, 1:request for forgot password");
    table.string("verificationCode", 255).nullable();
    table.integer("regionId").nullable().comment("1: region1, 2: region2, 3: region3").index();
    table
      .integer("role")
      .notNullable()
      .comment("1: superadmin, 2:admin, 3 team member, 4: customer user")
      .index();
    table
      .integer("status")
      .defaultTo(0)
      .notNullable()
      .comment("0: pending, 1:active, 2: inactive")
      .index();
    table.specificType("salt", "varchar(512)").nullable();
    table.specificType("hash", "varchar(512)").nullable();
    table
      .boolean("setTemporaryPassword")
      .defaultTo(false)
      .notNullable()
      .comment("false: actual password, true: temporary password set by super/admin/teammember");
    table.integer("createdBy").unsigned().nullable();
    table.integer("updatedBy").unsigned().nullable();
    table.datetime("last_logged_in");
    table.datetime("CreatedAt");
    table.datetime("UpdatedAt").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}
