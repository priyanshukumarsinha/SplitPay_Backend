
// This options object is used to set the cookie options for the JWT token
// It is used in the src/controllers/user.controllers.js file
// httOnly is set to true so that the cookie cannot be accessed by JavaScript on the client and can only be accessed by the server
// secure is set to true so that the cookie is only sent over HTTPS
export const options = {
    httpOnly : true,
    secure : true
}