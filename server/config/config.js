
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root', // Default to 'root'
    password: process.env.DB_PASSWORD, // Get password from .env
    database: process.env.DB_NAME || 'your_database_name', // Get db name
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  test: {
    // need to fill
  },
  production: {
    // need to fill
  }
};