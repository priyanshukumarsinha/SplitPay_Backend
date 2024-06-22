import express from 'express'

import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import { createGroup, getGroup, getGroups, getGroupMembers, addToGroup } from '../controllers/group.controllers.js'

const router = express.Router();

router.route('/createGroup').post(isLoggedIn, createGroup)
router.route('/getGroup/:id').get(isLoggedIn, getGroup)
router.route('/getGroups').get(isLoggedIn, getGroups)
router.route('/getGroupMembers/:id').get(isLoggedIn, getGroupMembers)
router.route('/addToGroup').post(isLoggedIn, addToGroup)

export {router}