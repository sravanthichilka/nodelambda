import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("assign_team_members", function (table) {
    table.increments("id").notNullable();
    table.integer("assignUserId").unsigned();
    table.foreign("assignUserId").references("id").inTable("users");
    table.integer("companyId").unsigned();
    table.foreign("companyId").references("id").inTable("companies");
    table.integer("createdBy").unsigned();
    table.foreign("createdBy").references("id").inTable("users");
    table.datetime("createdAt");
    table.datetime("updatedAt").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("assign_team_members");
}
