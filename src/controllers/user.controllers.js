// bring in Prisma
import {prisma} from '../../prisma/index.js'

// import the cookieToken function
import { cookieToken } from '../utils/cookieToken.js';

import bcrypt from 'bcrypt'

// create a new user
const createUser = async (req, res, next) => {
    try {
        const { firstName, lastName, username, email, password, phoneNumber, isEmailVerified, photoURL, dob } = req.body;

        // Check for username email and password
        if(!email || !username || !password) throw new Error ("Please Provide all Fields");

        // Check for unique username and email
        const userExists = await prisma.user.findFirst({
            where : {
                OR : [
                    {
                        email
                    },
                    {
                        username
                    }
                ]
            }
        })

        if(userExists) throw new Error ("User Already Exists with this Email or Username");

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                username,
                email,
                password : hashedPassword,
                phoneNumber,
                isEmailVerified,
                photoURL,
                dob : new Date(),
            },
        });

        // send user a token
        cookieToken(user, res)

    } catch (error) {
        console.log("Error while Signup");
        return res.status(500).json({
            status : 500,
            message: "Need Unique Username and Email",
            error: error.message
        })

    }
}


// Login user
const login = async(req, res, next) => {
    try {
        // take information from req.body
        const {username, email, password} = req.body;
        if((!email && !username) || !password) throw new Error ("Invalid Credentials!");

        // find a user based on email
        const user = await prisma.user.findUnique({
            where : {
                email
            }
        })
        
        // user not found
        if(!user) throw new Error ("No user exists with this Email!")

        // compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) throw new Error ("Invalid Credentials!");


        // User Exists
        cookieToken(user, res);


    } catch (error) {
        console.log("Error while Login", error);
        return res.status(500).json({
            status : 500,
            message: "Invalid Username or Password",
            error : error.message
        })
    }
}

// logout user
const logout = async(req, res, next) => {
    try {
        res.clearCookie('token').json({
            status : 201,
            success : true
        });
    } catch (error) {
        console.log("Error while Logout", error);
        return res.status(500).json({
            status : 500,
            message: "Invalid Username or Password",
            error : error.message
        })
    }
}

// Get all users
const getAllUsers = async(req, res, next) => {
    try {
        const users = await prisma.user.findMany();
        if(!users) throw new Error ("No Users Found");
        return res.status(400).json({
             success : true,
             users
        })
    } catch (error) {
        console.log("Error while getAllUsers", error);
        return res.status(500).json({
            status : 500,
            message: "Invalid Username or Password",
            error : error.message
        })
    }
}


// export the createUser function
export { createUser, login, logout, getAllUsers };

