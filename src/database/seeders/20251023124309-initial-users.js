'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    return queryInterface.sequelize.query(`
      INSERT INTO "users" ("id","name","email","password","profile","createdAt","updatedAt")
      VALUES
        ('${uuidv4()}', 'Admin User', 'admin@example.com', '${adminPassword}', 'admin', NOW(), NOW()),
        ('${uuidv4()}', 'Regular User', 'user@example.com', '${userPassword}', 'user', NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', {
      email: ['admin@example.com', 'user@example.com']
    });
  }
};
