import express from 'express'
import { createGroup, getGroup } from '../controllers/group.controllers.js'

import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// to create a new group : POST /api/group/create
router.route('/group/create').post(verifyJWT, createGroup);

// to get group details : GET /api/group/:groupId
router.route('/group/:id').get(verifyJWT, getGroup);


export {router}