// This file is used to create custom error classes for the API. 
// This is useful for creating custom error messages and handling them in a uniform way. 
// This file exports a class called ApiError which extends the Error class. 
// The constructor of the class takes the following parameters:
// statusCode: The status code of the error. 
// message: The error message.
// errors: An array of errors. Since there can be multiple errors, this parameter is optional.
// stack: The stack trace of the error. This parameter is optional.
// The stack trace of the error means the sequence of function calls that led to the error.
// The constructor sets the statusCode, message, errors, and stack properties of the class.
// The constructor also sets the success property to false. 
// Since this is an error class, the success property is set to false.
// The constructor also calls the Error.captureStackTrace method to capture the stack trace of the error.
// This method captures the stack trace of the error and sets it to the stack property of the class.
// We are putting the Error.captureStackTrace method in a conditional statement to check if the stack parameter is provided.
// If the stack parameter is provided, we set the stack property of the class to the stack parameter.
// Otherwise, we call the Error.captureStackTrace method to capture the stack trace of the error.

class ApiError extends Error {
    constructor(statusCode, message, errors = [], stack = ""){
        super(message);
        this.statusCode = statusCode;
        // this.data = data;
        this.message = message;
        this.sucess = false;
        this.errors = errors;
        if(stack) this.stack = stack;
        else Error.captureStackTrace(this, this.constructor);
    }
}

export {ApiError}

// 200C86136DD8