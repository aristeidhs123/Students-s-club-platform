import express from 'express'
import {newprivateannouncement,showallpubannounc} from '../controllers/announcmentsController.js'
const announcmentsrouter = express.Router()


announcmentsrouter.post('/newprivateannouncments', newprivateannouncement )
announcmentsrouter.get('/showpublicannouncments', showallpubannounc)