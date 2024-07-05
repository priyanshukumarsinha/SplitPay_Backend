import express from 'express'
import { createMessage, getMessages } from '../controllers/message.controller.js'

import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = express.Router();

// to create a new message : POST /api/message/create
router.route('/message/create').post(verifyJWT, createMessage);

// to get all messages in the group : GET /api/message/:groupId
router.route('/message/:groupId').get(verifyJWT, getMessages);


export {router}