import express from 'express';
import {
  createCompany,
  deleteAllCompanies,
  getCompanyDetails
} from '../controllers/company.js';
import { generateAccessToken } from '../middlewares/generateAccessToken.js';

const router = express.Router();

router.post('/', generateAccessToken, createCompany);
router.get('/:companyId', generateAccessToken, getCompanyDetails);
router.delete('/', generateAccessToken, deleteAllCompanies);

export default router;
