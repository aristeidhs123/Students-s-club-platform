import express from 'express'
import {createNewclub, showpendingClub,showclubs, rejectclub, acceptclub} from '../controllers/clubController.js'
const clubrouter = express.Router()


clubrouter.post('/newclub', createNewclub)
clubrouter.get('/showclubs', showallClub)
clubrouter.get('/pendingForms', showpendingClub)
clubrouter.post('/acceptnewclub', acceptclub)
clubrouter.post('/rejectnewclub', rejectclub)
