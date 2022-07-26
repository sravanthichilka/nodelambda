import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("companies", function (table) {
    table.increments("id").notNullable();
    table.string("preS3KeyName", 150).notNullable().unique();
    table.string("companyName", 300).notNullable().unique();
    table.string("companyAddress", 600).notNullable();
    table.string("uniqueId", 300).notNullable().unique();
    table.string("onSiteSystemData", 512).nullable().defaultTo("");
    table.integer("regionId").unsigned().comment("1: region1, 2: region2, 3: region3");
    table.foreign("regionId").references("id").inTable("regions");
    table.integer("createdBy").unsigned().nullable();
    table.foreign("createdBy").references("id").inTable("users");
    table.integer("updatedBy").unsigned().nullable();
    table.foreign("updatedBy").references("id").inTable("users");
    table.datetime("createdAt");
    table.datetime("updatedAt").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("companies");
}
