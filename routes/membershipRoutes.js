import express from 'express'
import {joinclub, pendingMemberships,showMembers, rejectMember, acceptMember, usmemberships} from '../controllers/membershipController.js'
const membershiprouter = express.Router()



membershiprouter.post('/joinclub',joinclub )
membershiprouter.get('/pendingmemberships',pendingMemberships )
membershiprouter.post('/acceptnewmember',acceptMember )
membershiprouter.post('/rejectnewmember',rejectMember )
membershiprouter.get('/showmembers',showMembers )
membershiprouter.post('/usersid',usmemberships)
membershiprouter.get('/usersmemberships',usmemberships )