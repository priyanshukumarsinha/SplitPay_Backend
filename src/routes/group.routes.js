import express from 'express'
import { createGroup, getGroup, addToGroup, removeMember, updateGroup } from '../controllers/group.controllers.js'

import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// to create a new group : POST /api/group/create
router.route('/group/create').post(verifyJWT, createGroup);

// to get group details : GET /api/group/:groupId
router.route('/group/:id').get(verifyJWT, getGroup);

// to add a member to the group : POST /api/group/:groupId/add
router.route('/group/add').post(verifyJWT, addToGroup);

// to remove a member from the group : DELETE /api/group/:groupId/removeq
router.route('/group/remove').delete(verifyJWT, removeMember);

// to update group details : PUT /api/group/:groupId/update
router.route('/group/update').put(verifyJWT, updateGroup);


export {router}