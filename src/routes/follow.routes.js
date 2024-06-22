import express from 'express'
import { followUser, getMyFollowers, getMyFollowing} from '../controllers/follow.controllers.js'
import { isLoggedIn } from '../middlewares/isLoggedIn.js';

const router = express.Router();


router.route('/follow/:username').get(isLoggedIn, followUser);
router.route('/followers').get(isLoggedIn, getMyFollowers);
router.route('/following').get(isLoggedIn, getMyFollowing);

export {router}