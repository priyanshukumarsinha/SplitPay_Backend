// This is the error handler middleware that we are going to use to send the error response
// which might occur while using AsyncHandler
// So we are going to use this middleware in the routes where we need to send the error response

import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    // check if the error is an instance of ApiError
    // if it is an instance of ApiError, which means it is a custom error
    // we are going to send the error response with the status code and message just like we did in the ApiError class
    // if it is not an instance of ApiError, which means it is a system error
    // we are going to send the error response with the status code 500 and message "Internal Server Error"
    if(err instanceof ApiError) {
        // send the error response
        return res.status(err?.statusCode).json({
            status : "error",
            statusCode : err.statusCode,
            message : err.message,
        });
    }

    // send the error response
    return res?.status(500).json({
        status : "error",
        statusCode : 500,
        message : "Internal Server Error",
        error : err,
        errorMsg : err?.message
    });

    // we are not calling next() because we are sending the response here
    // if we call next() it will go to the next middleware
    // do we need to call next() here? No, because we are sending the response here itself
}

export {errorHandler}

// This is the error handler middleware that we are going to use to send the error response
// this will not be used in the routes, this will be used in the app.js file
// we are going to use this middleware to handle the error that might occur in the application