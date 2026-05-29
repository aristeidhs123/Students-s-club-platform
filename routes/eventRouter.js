import express from 'express'
import {managerClubs, createEvent, showjoinevent, newreservation, showpendingres, acceptRes, rejectRes, showPrivateEvents} from '../controllers/eventController.js'
const eventrouter = express.Router()


eventrouter.post('/showmanagerid', managerClubs)
eventrouter.get('/showmanagerevents', managerClubs)
eventrouter.post('/newevent', createEvent)
eventrouter.get('/showusersevents', joinevent)
eventrouter.post('/joinevent', newreservation)
eventrouter.get('/showpendingreservation', showpendingres)
eventrouter.post('/acceptreservation', acceptRes)
eventrouter.post('/rejectreservation', rejectRes)
eventrouter.post('/showallevents', showAllEvents)
eventrouter.post('/showpublicevents', showPublicEvents)
eventrouter.post('/showprivateevents', showPrivateEvents)