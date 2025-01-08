import axios from 'axios';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyIdToken } from '../utils/verifyToken.js';

//create user in a realm
export const createUser = asyncHandler(async (req, res) => {
  const { realmName, username, password } = req.body;
  // const accessToken = req.cookies['access_token'];
  const accessToken = req.accessToken;

  // Validate access token
  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: 'Access token not found. Please log in.'
    });
  }

  // Validate required fields
  if (!realmName || !username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Realm name, username, and password are required.'
    });
  }

  // Construct the Keycloak API URL
  const url = `${process.env.KEYCLOAK_URL}/admin/realms/${realmName}/users`;

  // Construct payload for creating the user
  const newUserPayload = {
    username,
    enabled: true,
    credentials: [
      {
        type: 'password',
        value: password,
        temporary: false // Set to true if the user needs to reset the password on first login
      }
    ]
  };

  // Send the request to create the user
  await axios.post(url, newUserPayload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  // Respond with success
  res.status(201).json({
    success: true,
    message: `User "${username}" created successfully in realm "${realmName}".`
  });
});
