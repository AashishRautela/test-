import jwt from 'jsonwebtoken';

export const verifyIdToken = (idToken) => {
  try {
    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded) {
      throw new Error('Invalid ID token');
    }
    return decoded.payload;
  } catch (error) {
    throw new Error('Failed to verify ID token');
  }
};
