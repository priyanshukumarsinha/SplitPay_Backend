// This snippet is from src/utils/AsyncHandler.js:
// This file is used to create an async handler function for the API.
// This is useful for handling asynchronous functions in the API.
// This file exports an asyncHandler function that takes a requestHandler function as a parameter.
// The asyncHandler function returns an asynchronous function that takes the req, res, and next parameters.
// The asyncHandler function calls the requestHandler function with the req, res, and next parameters.
// The asyncHandler function wraps the requestHandler function in a Promise.resolve method.
// The Promise.resolve method resolves the requestHandler function and catches any errors that occur.
// If an error occurs, the asyncHandler function calls the next function with the error.
// The next function is used to pass the error to the error handling middleware.
// The error handling middleware can then handle the error and send an appropriate response to the client.
// TODO: Implement the error handling middleware in the API.

import { errorHandler } from "../middlewares/errorHandler.middleware"

const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(errorHandler(err, req, res, next)));
    }
}

export { asyncHandler }