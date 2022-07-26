import { Knex } from "knex";

/*
documentType =  {
   1: 'Chemical Usage History',
   2: 'P.O Records',
   3: 'Inventory management cost reports (IMCR)',
   4: 'Pricing',
   5: 'Training Documents'
   6: 'Letters of Guarantee',
   7: 'Certificates of Analysis',
   8: 'Certificates of Insurance',
   9: 'Technical Data Sheets'
  };
*/

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("documents", function (table) {
    table.increments("id").notNullable();
    table.integer("companyId").unsigned().comment("dont query on it. will delete this.");
    table.foreign("companyId").references("id").inTable("companies");
    table.string("documentKeyName", 150).notNullable().unique();
    table.integer("documentType").unsigned().notNullable().comment("table document_types");
    table.foreign("documentType").references("id").inTable("document_types");
    table.string("documentName", 600).notNullable().unique();
    table.string("documentFormat", 10).notNullable().comment("pdf/jpg/jpeg");
    table.string("documentsizeInByte", 20).notNullable();
    table
      .integer("permissionSuperAdmin")
      .unsigned()
      .notNullable()
      .defaultTo(2)
      .comment("1: viewer, 2 editor");
    table
      .integer("permissionAdmin")
      .unsigned()
      .notNullable()
      .defaultTo(2)
      .comment("1: viewer, 2 editor");
    table
      .integer("permissionTeamMember")
      .unsigned()
      .notNullable()
      .defaultTo(2)
      .comment("1: viewer, 2 editor");
    table
      .integer("permissionCustomerUser")
      .unsigned()
      .notNullable()
      .defaultTo(2)
      .comment("1: viewer, 2 editor");
    table.integer("createdBy").unsigned().nullable();
    table.foreign("createdBy").references("id").inTable("users");
    table.integer("updatedBy").unsigned().nullable();
    table.foreign("updatedBy").references("id").inTable("users");
    table.boolean("isDeleted").defaultTo(false).comment("softdelete true, otherwise false");
    table.datetime("createdAt");
    table.datetime("updatedAt").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("documents");
}
