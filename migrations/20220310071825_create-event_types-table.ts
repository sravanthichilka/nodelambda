import { Knex } from "knex";

// /USE CONSTANT:  ENUM_EVENT_TYPE_LOGS
export async function up(knex: Knex): Promise<void> {
  return;
  // return knex.schema
  // .createTable('event_types', function(table) {
  //     table.increments('id').notNullable();
  //     table.string('eventTypeName',300).notNullable();
  //     table.integer('status').defaultTo(1).notNullable().comment('1:active, 2: inactive');
  //     table.datetime('createdAt').defaultTo(knex.fn.now());
  //     table.datetime('updatedAt').defaultTo(knex.fn.now());
  // })
}

export async function down(knex: Knex): Promise<void> {
  return;
  // return knex.schema.dropTable('event_types');
}
