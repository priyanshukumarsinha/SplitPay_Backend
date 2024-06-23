// bring in Prisma
import {prisma} from '../../prisma/index.js'
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';

// import the cookieToken function
import { generateAccessToken } from '../utils/generateAccessToken.js';
import { generateRefreshToken } from '../utils/generateRefreshToken.js';

import bcrypt, { compare, hash } from 'bcrypt'
import { options } from '../constants.js';

// Hash
const hashData = async (data) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(toString(data), salt);
    return hash;
}

// Compare Hash
const compareHash = async (data, hash) => {
    const compare = await bcrypt.compare(toString(data), toString(hash));
    return compare;
}

// Generate Access and Refresh Token
const generateAccessRefreshToken = async (userId) => {
    // find the user 
    const user = await prisma.user.findUnique({
        where : {
            id : userId
        }
    });

    // Access Token
    const accessToken = generateAccessToken(user);
    
    // Refresh Token
    const refreshToken = generateRefreshToken(user);

    // How is Access and Refresh Token Works is 
    // 1. Access Token is used to authenticate user and access protected routes
    // 2. Refresh Token is used to generate new Access Token when the Access Token is expired
    // 3. Refresh Token is stored in the HttpOnly Cookie and also in the Database
    // 4. When the Access Token is expired, the Refresh Token is used to generate new Access Token
    // 5. If the Refresh Token is expired, the user needs to login again

    // How it actually works is : 
    // 1. User Logs In
    // 2. Access Token and Refresh Token is generated
    // 3. Access Token is sent to the user in the response and stored in the Local Storage
    // 4. Refresh Token is stored in the HttpOnly Cookie
    // 5. Refresh Token is stored in the Database
    // 6. When the Access Token is expired, does the user needs to login again? No 
    // 7. When the Access Token is expired, the Refresh Token is used to generate new Access Token. But How?
    // TODO: More Explanation
    
    // Store the Refresh Token in the Database
    await prisma.user.update({
        where : {
            id : userId
        },
        data : {
            refreshToken
        }
    });

    // We will store the Refresh Token in the HttpOnly Cookie in the response in the login function itself

    // return the Access Token and Refresh Token
    return {accessToken, refreshToken};
}

// create a new user : testing done
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


    // create a new user
    const user = await prisma.user.create({
        data: {
            firstName : firstName.trim(),
            lastName : lastName.trim(),
            username : username.trim().toLowerCase(),
            email : email.trim().toLowerCase(),
            password : await hashData(password),
            phoneNumber : phoneNumber || null,
            isEmailVerified : isEmailVerified || false,
            photoURL : photoURL || "https://www.gravatar.com/avatar/",
            dob : dob || new Date('01/01/2000'),
        },
    });

    // check if user is created
    const createdUser = await prisma.user.findUnique({
        where : {
            id : user.id
        },
        select : {
            id : true,
            firstName : true,
            lastName : true,
            username : true,
            email : true,
            phoneNumber : true,
            isEmailVerified : true,
            photoURL : true,
            dob : true,
            password : false,
            refreshToken : false
        }
    });

    // throw error if user is not created
    if(!createdUser) throw new ApiError(501, "Error while Creating User");

    // send response
    const response = new ApiResponse(201, createdUser, "User Created Successfully");
    return res.status(201).json(response);
    
});


// Login user : testing done
const login = asyncHandler(async (req, res) => {
    // take information from req.body
    const {username, email, password} = req.body;

    // Check for username email and password
    if((!email && !username) || !password) throw new ApiError(401, "Please Provide all Fields");

    // query
    const query = email ? {email} : {username};

    // find a user based on email or username
    // we are using OR condition to find the user based on email or username
    // if the user is found, we will not return the password and refresh token
    // if the user is not found, we will throw an error
    const user = await prisma.user.findUnique({
        where : query,
        select : {
            id : true,
            firstName : true,
            lastName : true,
            username : true,
            email : true,
            phoneNumber : true,
            isEmailVerified : true,
            photoURL : true,
            dob : true,
            password : false,
            refreshToken : false
        },
    })
    
    // user not found
    if(!user) throw new ApiError(404, "No user exists with this Email!")

    // compare the password
    const isPasswordValid = compareHash(password, user.password);
    if(!isPasswordValid) throw new ApiError(401, "Invalid Credentials!");

    // hide password
    user.password = undefined;

    // Access and Refresh Token
    // we are generating the Access and Refresh Token for the user
    const {accessToken, refreshToken} = await generateAccessRefreshToken(user.id);

    // send response
    // we are sending the Access Token in the response and storing the Refresh Token in the HttpOnly Cookie
    // we are also storing the Refresh Token in the Database for future use to generate new Access Token
    // we are not storing the Access Token in the Database because it is not required 
    const response = new ApiResponse(200, {user}, "User Logged In Successfully");
    return res.status(200)
              .cookie('accessToken', accessToken, options)
              .cookie('refreshToken', refreshToken, options)
              .json(response);
});

// logout user : testing done
const logout = asyncHandler(async (req, res) => {
    // remove the Refresh Token from the Database
    // we are removing the Refresh Token from the Database so that the user cannot generate new Access Token
    // Even after the user logs out, the Access Token is still valid until it expires
    // But the user cannot generate new Access Token after logging out because the Refresh Token is removed from the Database
    
    await prisma.user.update({
        where : {
            id : req.user.id
        },
        data : {
            refreshToken : null
        }
    });


    // send response
    // we are sending the response with the message that the user is logged out
    // we are also clearing the cookies in the response
    const response = new ApiResponse(200, {}, "User Logged Out Successfully");
    return res.status(200)
              .clearCookie('accessToken', options)
              .clearCookie('refreshToken', options)
              .json(response);
});

// update user details
const updateUser = asyncHandler(async (req, res) => {});

// delete user
const deleteUser = asyncHandler(async (req, res) => {
    // delete the user
    const user = await prisma.user.delete({
        where : {
            id : req.user.id
        }
    });

    // send response
    const response = new ApiResponse(200, {}, "User Deleted Successfully");
    return res.status(200).json(response);
});

// get Current User Details
const getCurrentUser = asyncHandler(async (req, res) => {});

// get User Details by Username
const getUserByUsername = asyncHandler(async (req, res) => {});

// change password
const changePassword = asyncHandler(async (req, res) => {});

// change photoURL
const changePhotoURL = asyncHandler(async (req, res) => {});

// get list of followers
const getFollowers = asyncHandler(async (req, res) => {});

// get list of following
const getFollowing = asyncHandler(async (req, res) => {});

// get list of all groups user is part of
const getGroups = asyncHandler(async (req, res) => {});

// verify email
const verifyEmail = asyncHandler(async (req, res) => {});


// export the functions
export { 
    createUser, 
    login, 
    logout, 
    updateUser, 
    deleteUser, 
    getCurrentUser, 
    getUserByUsername, 
    changePassword, 
    changePhotoURL, 
    getFollowers, 
    getFollowing, 
    getGroups,
    verifyEmail
};

