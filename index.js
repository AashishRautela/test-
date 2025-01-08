import express from 'express';
import dotenv from 'dotenv';
import sequelize from './src/database/database.js';
import { app } from './app.js';

dotenv.config({ path: 'config.env' });

const PORT = process.env.PORT || 3002;

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
    process.exit(1);
  }
};

app.listen(PORT, async () => {
  await testDbConnection(); // Ensure this function is called
  try {
    await sequelize.sync({ force: false }); // Synchronize models with the database
    console.log('Database & tables created!');
  } catch (error) {
    console.error('Error creating database & tables:', error);
    process.exit(1);
  }
  console.log(`Server is listening at port ${PORT}`);
});
