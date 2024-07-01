import express from 'express'
import { followUser, getMyFollowers, getMyFollowing} from '../controllers/follow.controllers.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

//  /api/follow
// This route will allow the logged-in user to follow another user.
router.route('/follow/:username').get(verifyJWT, followUser);

// /api/follow/followers
// This route will return the list of users that are following the logged-in user.
router.route('/followers').get(verifyJWT, getMyFollowers);

// /api/follow/following
// This route will return the list of users that the logged-in user is following.
router.route('/following').get(verifyJWT, getMyFollowing);

export {router}