// import { asyncHandler } from '../utils/asyncHandler.js';
// import jwt from 'jsonwebtoken';
// import axios from 'axios';

// export const generateAccessToken = asyncHandler(async (req, res, next) => {
//   const { refresh_token } = req.cookies;

//   if (!refresh_token) {
//     return res.status(401).json({
//       success: false,
//       message: 'Refresh token not found. Please log in.'
//     });
//   }

//   const decoded = jwt.decode(refresh_token, { complete: true });

//   if (!decoded || !decoded.payload || !decoded.payload.iss) {
//     return res.status(400).json({
//       success: false,
//       message: 'Invalid refresh token. Unable to decode.'
//     });
//   }

//   const issuer = decoded.payload.iss;

//   const realm = issuer.split('/').pop();

//   const response = await axios.post(
//     `${issuer}/protocol/openid-connect/token`,
//     new URLSearchParams({
//       grant_type: 'refresh_token',
//       client_id: process.env.KEYCLOAK_CLIENT_ID,
//       refresh_token
//     }),
//     {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     }
//   );

//   const { access_token, refresh_token: newRefreshToken } = response.data;

//   res.cookie('access_token', access_token, { httpOnly: true });
//   res.cookie('refresh_token', newRefreshToken, { httpOnly: true });

//   next();
// });

import axios from 'axios';
import { asyncHandler } from '../utils/asyncHandler.js';

export const generateAccessToken = asyncHandler(async (req, res, next) => {
  const {
    KEYCLOAK_URL,
    KEYCLOAK_USER_NAME,
    KEYCLOAK_USER_PASSWORD,
    KEYCLOAK_CLIENT_ID
  } = process.env;

  // Construct the Keycloak token URL
  const tokenUrl = `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`;

  // Request body for token generation
  const requestBody = new URLSearchParams({
    grant_type: 'password',
    client_id: KEYCLOAK_CLIENT_ID,
    username: KEYCLOAK_USER_NAME,
    password: KEYCLOAK_USER_PASSWORD
  });

  // Call Keycloak API to generate access and refresh tokens
  const response = await axios.post(tokenUrl, requestBody, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  // Extract tokens from the response
  const { access_token, refresh_token } = response.data;

  // Set tokens as HTTP-only cookies
  res.cookie('access_token', access_token, { httpOnly: true });
  res.cookie('refresh_token', refresh_token, { httpOnly: true });

  // Attach the access token to the request object for immediate use
  req.accessToken = access_token;

  // Proceed to the next middleware
  next();
});
