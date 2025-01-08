import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//import routers

import authRouter from './src/routes/auth.js';
import companyRouter from './src/routes/company.js';
import userRouter from './src/routes/user.js';

//server health check

app.use("/",(req,res)=>{
  res.send("Welcome to PaidEarly Server");
})
app.use('/server/health', (req, res, next) => {
  res.send({ success: true, message: 'PaidEarly Server is running..' });
});

//mount all routes
app.use('/auth', authRouter);
app.use('/company', companyRouter);
app.use('/user', userRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message
  });
});
export { app };
