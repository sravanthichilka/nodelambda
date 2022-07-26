import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("company_users", function (table) {
    table.increments("id").notNullable();
    table.integer("companyId").unsigned();
    table.foreign("companyId").references("id").inTable("companies");

    table
      .boolean("isCompanyOwner")
      .defaultTo(false)
      .comment("first company detail added with user info then it will be true otherwise false");

    table.integer("userId").unsigned();
    table.foreign("userId").references("id").inTable("users");

    table.integer("createdBy").unsigned().nullable();
    table.foreign("createdBy").references("id").inTable("users");
    table.datetime("createdAt");
    table.datetime("updatedAt").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("company_users");
}
