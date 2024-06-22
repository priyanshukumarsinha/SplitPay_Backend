import express from 'express'
import { followUser} from '../controllers/follow.controllers.js'
import { isLoggedIn } from '../middlewares/isLoggedIn.js';

const router = express.Router();


router.route('/follow/:username').get(isLoggedIn, followUser);

export {router}