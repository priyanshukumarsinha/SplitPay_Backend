import express from 'express'
import { followUser, unfollowUser} from '../controllers/follow.controllers.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

//  /api/follow
// This route will allow the logged-in user to follow another user.
router.route('/follow/:username').get(verifyJWT, followUser);

//  /api/unfollow
// This route will allow the logged-in user to unfollow another user.
router.route('/unfollow/:username').delete(verifyJWT, unfollowUser);

export {router}