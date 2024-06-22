import express from 'express'

// import the user controllers
import {
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
} from '../controllers/user.controllers.js'

// import the verifyJWT middleware
import { verifyJWT } from '../middlewares/auth.middleware.js';


// create a new router
const router = express.Router();

// ROUTES:

// to create a new user : POST /api/create
router.route('/create').post(createUser);

// to login a user : POST /api/login
router.route('/login').post(login);

// to logout a user : POST /api/logout
// SECURED ROUTES : why? because we need to be logged in to logout
// only verified (or loggedin Users) should be able to logout, hence use verifyJWT middleware
router.route('/logout').post(verifyJWT, logout);

// to update user details : PUT /api/update
// SECURED ROUTES : why? because we need to be logged in to update user details
// only verified (or loggedin Users) should be able to update user details, hence use verifyJWT middleware
router.route('/update').put(verifyJWT, updateUser);

// to delete a user : DELETE /api/delete
// SECURED ROUTES : why? because we need to be logged in to delete a user
// only verified (or loggedin Users) should be able to delete a user, hence use verifyJWT middleware
router.route('/delete').delete(verifyJWT, deleteUser);

// to get current user details : GET /api/me
// SECURED ROUTES : why? because we need to be logged in to get current user details
// only verified (or loggedin Users) should be able to get current user details, hence use verifyJWT middleware
router.route('/me').get(verifyJWT, getCurrentUser);

// to get user details by username : GET /api/user/:username
router.route('/user/:username').get(getUserByUsername);

// to change password : PUT /api/change-password
// SECURED ROUTES : why? because we need to be logged in to change password
// only verified (or loggedin Users) should be able to change password, hence use verifyJWT middleware
router.route('/change-password').put(verifyJWT, changePassword);

// to change photoURL : PUT /api/change-photo
// SECURED ROUTES : why? because we need to be logged in to change photoURL
// only verified (or loggedin Users) should be able to change photoURL, hence use verifyJWT middleware
router.route('/change-photo').put(verifyJWT, changePhotoURL);

// to get list of followers : GET /api/followers
// SECURED ROUTES : why? because we need to be logged in to get list of followers
// only verified (or loggedin Users) should be able to get list of followers, hence use verifyJWT middleware
router.route('/followers').get(verifyJWT, getFollowers);

// to get list of following : GET /api/following
// SECURED ROUTES : why? because we need to be logged in to get list of following   
// only verified (or loggedin Users) should be able to get list of following, hence use verifyJWT middleware
router.route('/following').get(verifyJWT, getFollowing);

// to get list of all groups user is part of : GET /api/groups
// SECURED ROUTES : why? because we need to be logged in to get list of groups
// only verified (or loggedin Users) should be able to get list of groups, hence use verifyJWT middleware
router.route('/groups').get(verifyJWT, getGroups);

// to verify email : GET /api/verify-email
// SECURED ROUTES : why? because we need to be logged in to verify email
// only verified (or loggedin Users) should be able to verify email, hence use verifyJWT middleware
router.route('/verify-email').get(verifyJWT, verifyEmail);

// export the router
export {router}


// Path: src/controllers/user.controllers.js