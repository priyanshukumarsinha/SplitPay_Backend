// This middleware is used to check if the user is authenticated or not

import { asyncHandler } from "../utils/AsyncHandler.js";

// when the user is logged in we set the req.user to the user object
// if the user is not logged in we set req.user to null

// we are going to use accessToken and refreshToken to verify the user
// we are going to check if the accessToken is valid or not
// if the accessToken is valid we set the req.user to the user object since the user is authenticated
// if the accessToken is not valid we check if the refreshToken is valid or not by checking the database and matching the refreshToken in the cookie with the refreshToken in the database
// if the refreshToken is valid we set the req.user to the user object since the user is authenticated and we generate a new accessToken and refreshToken and send it in the response
// if the refreshToken is not valid we set the req.user to null since the user is not authenticated

// we are going to use this middleware in the routes where we need to check if the user is authenticated or not, wherever we need authentication

const verifyJWT = asyncHandler(async (req, res, next) => {
    // how will next know that we have to use the errorHandler middleware
    // if we use next() then it will go to the next middleware
    // if we use next(error) then it will go to the errorHandler middleware
    // even if we use next() in the asyncHandler, it will go to the errorHandler middleware if there is an error on its own
    // because the asyncHandler is wrapping the function with try catch block and calling next(error) in the catch block

    // get the accessToken from the cookies
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    // what is this req.header("Authorization")?.replace("Bearer ", "") doing?
    // we are getting the Authorization header from the request
    // what is the Authorization header? It is the header that contains the accessToken
    // is it not stored in the cookies? It is stored in the cookies. But we are also sending the accessToken in the Authorization header
    // when did we send it to the Authorization header? We are sending it in the Authorization header when we are making a request to the API
    // okay so it happens automatically? Yes, it happens automatically when we are using the fetch API
    // okay so we are getting the accessToken from the cookies or the Authorization header
    // what is the replace("Bearer ", "") doing? The accessToken is stored in the Authorization header as "Bearer accessToken"
    // why is it stored like that? It is stored like that because it is a standard way of storing the accessToken in the Authorization header
    // okay so we are getting the accessToken from the Authorization header and removing the "Bearer " from it
    // How is it actually stored in the Authorization header? It is stored like this
    // Authorization: Bearer accessToken
    // okay so we are getting the accessToken from the Authorization header and removing the "Bearer " from it

    // check if the accessToken is present
    if(!accessToken) {
        // send the error response
        return next(new ApiError(401, "Unauthorized"));
    }

    // get decoded user from the accessToken
    const decodedUser = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    // what is this jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET) doing?
    // we are verifying the accessToken using the ACCESS_TOKEN_SECRET
    // what is the ACCESS_TOKEN_SECRET? It is the secret key that is used to sign the accessToken
    // how is the accessToken signed? The accessToken is signed using the ACCESS_TOKEN_SECRET
    // okay so we are verifying the accessToken using the ACCESS_TOKEN_SECRET
    // what is the decodedUser? The decodedUser is the user object that is stored in the accessToken
    // how is the user object stored in the accessToken? The user object is stored in the accessToken when the accessToken is generated

    // get the user from the database
    const user = await prisma.user.findUnique({
        where : {
            id : decodedUser.userID
        },
        select : {
            password : false,
            refreshToken : false
        }
    });

    // check if the user exists
    if(!user) {
        // send the error response
        return next(new ApiError(401, "Invalid Access Token"));
    }

    // set the req.user to the user object
    // we are setting the req.user to the user object so that we can use it in the next middlewares
    // we are setting the req.user to the user object because the user is now authenticated
    req.user = user;

    // do next checks
    next();

});

export { verifyJWT };

// This middleware is used to verify the JWT token
// This middleware is used to check if the user is authenticated or not
// Now how to use it? We are going to use it in the routes where we need to check if the user is authenticated or not
// We are going to use it in the routes where we need authentication