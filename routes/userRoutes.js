import express from 'express'
import {createNewuser, login ,returnUser} from '../controllers/userController.js'
const userrouter = express.Router()


userrouter.post('/newuser', createNewuser)
userrouter.post('/login', login)
userrouter.get('/profile', returnUser)
export default userrouter