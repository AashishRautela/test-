import axios from 'axios';
import { asyncHandler } from '../utils/asyncHandler.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import CompanyRepository from '../repository/company.js';
import validator from 'validator';
import UserRepository from '../repository/user.js';
import sequelize from '../database/database.js';

// Create a new company
export const createCompany = asyncHandler(async (req, res) => {
  const { name, domain, email, password, role } = req.body;

  if (!name || !domain || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: name, domain, email, password'
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email is not valid'
    });
  }

  const accessToken = req.accessToken;
  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: 'Access token not found. Please log in.'
    });
  }

  const existingCompany = await CompanyRepository.findByName(name);
  if (existingCompany) {
    return res.status(400).json({
      success: false,
      message: 'Company already exists'
    });
  }

  const transaction = await sequelize.transaction();

  try {
    const realmPayload = { realm: name, enabled: true };
    await axios.post(`${process.env.KEYCLOAK_URL}/admin/realms`, realmPayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const realmInfoResponse = await axios.get(
      `${process.env.KEYCLOAK_URL}/admin/realms/${name}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    const realmId = realmInfoResponse.data.id;

    const api_key = uuidv4();
    const hashedApiKey = await bcrypt.hash(api_key, 10);

    const company = await CompanyRepository.create(
      {
        name,
        domain,
        realm: name,
        realmId,
        api_key: hashedApiKey
      },
      { transaction }
    );

    const userPayload = {
      username: email,
      email,
      enabled: true,
      firstName: email,
      lastName: email,
      credentials: [{ type: 'password', value: password, temporary: false }]
    };
    await axios.post(
      `${process.env.KEYCLOAK_URL}/admin/realms/${name}/users`,
      userPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const usersResponse = await axios.get(
      `${process.env.KEYCLOAK_URL}/admin/realms/${name}/users?username=${email}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const keycloakUserId = usersResponse.data[0].id;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserRepository.createUser(
      {
        keycloakUserId,
        email,
        password: hashedPassword,
        realmId,
        companyId: company.id,
        role: role || 'admin'
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Company and admin user created successfully',
      data: {
        company: {
          id: company.id,
          name: company.name,
          api_key: api_key
        },
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    await transaction.rollback();

    try {
      await axios.delete(`${process.env.KEYCLOAK_URL}/admin/realms/${name}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    } catch (cleanupError) {
      console.error('Failed to clean up Keycloak realm:', cleanupError.message);
    }
    throw error;
  }
});

//get company details
export const getCompanyDetails = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const company = await CompanyRepository.findById(companyId, {
    attributes: ['id', 'name', 'createdAt', 'updatedAt']
  });
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }
  res.status(200).json({
    success: true,
    data: company
  });
});

// Delete a company
export const deleteCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: 'Company ID is required'
    });
  }

  const company = await CompanyRepository.findById(companyId);
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  const accessToken = req.cookies['access_token'];
  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: 'Access token not found. Please log in.'
    });
  }

  const transaction = await sequelize.transaction();
  try {
    // Delete the realm in Keycloak
    await axios.delete(
      `${process.env.KEYCLOAK_URL}/admin/realms/${company.realm}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    // Delete the company from the database
    await CompanyRepository.deleteById(companyId, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete company',
      error: error.message
    });
  }
});

//function to delete all companied(this is for dev only)
export const deleteAllCompanies = asyncHandler(async (req, res, next) => {
  // const accessToken = req.cookies['access_token'];
  const accessToken = req.accessToken;

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: 'Access token not found. Please log in.'
    });
  }

  const getRealmsUrl = `${process.env.KEYCLOAK_URL}/admin/realms`;
  const realmsResponse = await axios.get(getRealmsUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const realms = realmsResponse.data;

  // Delete each realm except 'master'
  for (const realm of realms) {
    if (realm.realm !== 'master') {
      const deleteRealmUrl = `${process.env.KEYCLOAK_URL}/admin/realms/${realm.realm}`;

      await axios.delete(deleteRealmUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      console.log(`Realm "${realm.realm}" deleted successfully.`);
    }
  }

  res.status(200).json({
    success: true,
    message: 'All realms (except master) deleted successfully.'
  });
});
