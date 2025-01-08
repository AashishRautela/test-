import axios from 'axios';
import { asyncHandler } from '../utils/asyncHandler.js';
import UserRepository from '../repository/user.js';
import CompanyRepository from '../repository/company.js';

//login to super admin
export const loginToSuperAdmin = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  console.log('process.env.KEYCLOAK_URL', process.env.KEYCLOAK_URL);
  const response = await axios.post(
    `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
    new URLSearchParams({
      grant_type: 'password',
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      username,
      password
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  const { access_token, refresh_token, token_type, expires_in } = response.data;

  res
    .cookie('access_token', access_token)
    .cookie('refresh_token', refresh_token, { httpOnly: true }) //http only
    .status(200)
    .json({
      success: true,
      message: 'Login successful',
      access_token,
      refresh_token,
      token_type,
      expires_in
    });
});

// Login in company
export const login = asyncHandler(async (req, res) => {
  const { companyId, email, password } = req.body;

  if (!companyId || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Company ID, username, and password are required'
    });
  }

  try {
    // Find the user based on the company ID and username
    const user = await UserRepository.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Retrieve the realmId from the company
    const company = await CompanyRepository.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const realmName = company.name;

    // Login the user in Keycloak
    const tokenResponse = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${realmName}/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        username: email,
        password: password,
        grant_type: 'password'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Set tokens as HTTP-only cookies
    res.cookie('access_token', access_token, { httpOnly: true });
    res.cookie('refresh_token', refresh_token, { httpOnly: true });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken: access_token,
      refreshToken: refresh_token
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
});
