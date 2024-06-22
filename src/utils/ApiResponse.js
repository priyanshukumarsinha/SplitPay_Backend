// This file is used to create custom Response classes for the API.
// This is useful for creating custom response messages and handling them in a uniform way.
// This file exports a class called ApiResponse which takes the following parameters:
// statusCode: The status code of the response.
// data: The data to be sent in the response.
// message: The response message. This parameter is optional and defaults to "Success". 
// Since this is a response class, the success property is set to true.
// The constructor sets the statusCode, data, message, and success properties of the class.
// The constructor also sets the success property to true if the statusCode is less than 400. 
// If the statusCode is less than 400, it means that the request was successful.

class ApiResponse{
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.sucess = statusCode < 400;
    }
}

export {ApiResponse}