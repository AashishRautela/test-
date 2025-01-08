import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_Name, // Database name
  process.env.User_Name, // Database username
  process.env.Password, // Database password
  {
    host: process.env.Middleware_Host,
    port: process.env.middleware_port,
    dialect: 'postgres', // PostgreSQL dialect
    logging: false, // Disable logging or use `console.log` for debugging queries
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

export default sequelize;
