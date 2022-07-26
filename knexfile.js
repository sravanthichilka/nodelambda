require('ts-node').register()

module.exports = require('./src/config/database').Knex.config;