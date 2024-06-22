// bring in Prisma
import {prisma} from '../../prisma/index.js'
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';

// import the cookieToken function
import { cookieToken } from '../utils/cookieToken.js';

import bcrypt, { compare } from 'bcrypt'

// Hash
const hashData = async (data) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, salt);
}

// Compare Hash
const compareHash = async (data, hash) => {
    return await bcrypt.compare(data, hash);
}

// create a new user
const createUser = asyncHandler(async (req, res) => {
    // take information from req.body
    const { firstName, lastName, username, email, password, phoneNumber, isEmailVerified, photoURL, dob } = req.body;

    // Check for username email and password
    if(!email || !username || !password) throw new ApiError(404, "Please Provide all Fields");

    // Check for unique username and email
    const userExists = await prisma.user.findFirst({
        where : { OR : [{email}, {username}] }
    })

    if(userExists) throw new ApiError(500, "User Already Exists with this Email or Username");

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create a new user
    const user = await prisma.user.create({
        data: {
            firstName : firstName.trim(),
            lastName : lastName.trim(),
            username : username.trim().toLowerCase(),
            email : email.trim().toLowerCase(),
            password : hashData(password),
            phoneNumber : hashData(phoneNumber).trim(),
            isEmailVerified : isEmailVerified || false,
            photoURL : photoURL || "https://www.gravatar.com/avatar/",
            dob : dob || new Date('01/01/2000'),
        },
    });

    // check if user is created
    const createdUser = await prisma.user.findUnique({
        where : {
            id : user.id
        }
    });

    // throw error if user is not created
    if(!createdUser) throw new ApiError(501, "Error while Creating User");

    // send user a token
    // this cookieToken function will set a cookie in the browser
    // this cookie will be used to authenticate the user
    // if the cookie exists, it means the user is logged in
    // So here, we are actually logging in the user after creating the user automatically
    cookieToken(user, res)

    // send response
    const response = new ApiResponse(201, createdUser, "User Created Successfully");
    return res.status(201).json(response);
    
});


// Login user
const login = asyncHandler(async (req, res) => {
    // take information from req.body
    const {username, email, password} = req.body;

    // Check for username email and password
    if((!email && !username) || !password) throw new ApiError(401, "Please Provide all Fields");

    // find a user based on email or username
    const user = await prisma.user.findUnique({
        where : { OR : [{email}, {username}] }
    })
    
    // user not found
    if(!user) throw new ApiError(404, "No user exists with this Email!")

    // compare the password
    const isMatch = compareHash(password, user.password);
    if(!isMatch) throw new ApiError(401, "Invalid Credentials!");

    // hide password
    user.password = undefined;

    // User Exists : send user a token : cookieToken
    // if the cookieToken exists, it means the user is logged in
    cookieToken(user, res);

    // send response
    const response = new ApiResponse(200, user, "User Logged In Successfully");
    return res.status(200).json(response);
});

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

