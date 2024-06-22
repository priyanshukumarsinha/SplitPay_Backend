import { getJwtToken } from "./getJwtToken.js";

const cookieToken = (user, res) => {
    const token = getJwtToken(user.id);
    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    }
    user.password = undefined;
    res.status(200).cookie('token', token, options).json({
        success: true,
        token,
        user
    });
}

export { cookieToken}