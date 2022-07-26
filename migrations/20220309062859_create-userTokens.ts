import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("user_tokens", function (table) {
    table.increments("id").notNullable();
    table.integer("userId").unsigned();
    table.foreign("userId").references("id").inTable("users");
    table.string("userAgent", 200).nullable();
    table.datetime("issueAt").comment("token issue at").defaultTo(knex.fn.now());
    table.datetime("expireAt").comment("token expire at");
    table.string("refreshToken", 300).notNullable().index();
    table.datetime("createdAt");
    table.datetime("updatedAt").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("user_tokens");
}
