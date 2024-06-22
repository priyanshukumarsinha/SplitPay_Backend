import express from 'express'
import { createUser, getAllUsers, login, logout } from '../controllers/user.controllers.js'

const router = express.Router();

router.route('/signup').post(createUser)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/getAllUsers').get(getAllUsers)

export {router}