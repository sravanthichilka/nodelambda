import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("document_types", function (table) {
    table.increments("id").notNullable();
    table.string("documentTypeName", 300).notNullable();
    table.integer("status").defaultTo(1).notNullable().comment("1:active, 2: inactive");
    table.datetime("createdAt");
    table.datetime("updatedAt").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("document_types");
}
