import jwt from 'jsonwebtoken';

const getJwtToken = (userID) => {
  return jwt.sign({userID}, process.env.JWT_SECRET, {expiresIn: '1 day'})
}

export { getJwtToken };