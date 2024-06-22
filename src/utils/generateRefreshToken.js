import jwt from 'jsonwebtoken';

const generateRefreshToken = (user) => {
    return jwt.sign({
        id : user.id,
        email : user.email,
        username : user.username
    }, 
    process.env.REFRESH_TOKEN_SECRET, 
    {expiresIn : process.env.REFERSH_TOKEN_EXPIRY})
}

export {generateRefreshToken}