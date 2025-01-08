import express from 'express';
import { generateAccessToken } from '../middlewares/generateAccessToken.js';
import { createUser } from '../controllers/user.js';

const router = express.Router();

router.post('/', generateAccessToken, createUser);

export default router;
