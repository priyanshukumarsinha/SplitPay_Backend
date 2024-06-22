import { prisma } from "../../prisma/index.js";
import jwt from "jsonwebtoken";

const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) throw new Error ("Unauthenticated User");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await prisma.user.findUnique({
            where : {
                id : decoded.userID
            }
        })

        //do next checks
        next();

    } catch (error) {
        throw new Error (error)
    }
}

export {isLoggedIn}