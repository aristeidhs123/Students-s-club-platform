import express, { response } from 'express'
import {returnusrole, newevent, showallevents, showclubevents, showpublicevents, showprivateevents, searchmanagerclubs, checkeventsloc, searchmemberships, reservationevent, showpendingreservation, acceptreservation, rejectreservation} from '../models/mydatabase.js'

export const managerClubs = async(req, res)=> {
    try{
            const managerid = req.body
            if(returnusrole(managerid) === 'manager'){
                const managersclubs = searchmanagerclubs(managerid) 
                res.status(200).json({data: managersclubs, message:"success"})
            }
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}


export const createEvent = async(req, res)=>{
    try{
        const event = req.body
        const alreadyusedlocation = checkeventsloc(event.location, event.starttime, event.endtime)
        if(!alreadyusedlocation){
            newevent(event.evclubid, event.title, event.description, event.role , event.seats, event.location, event.gplatos, event.gmikos, event.starttime, event.endtime)
        }
        
        res.status(200).json({ message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }

}


export const showjoinevent = async(req, res)=>{
    try{
        const usersclubs = searchmemberships()
        if(usersclubs){
            const usersevent = showclubevents(usersclubs.membership)
            res.status(200).json({data: usersevent, message:"success"})
        }
        else{
            console.log("you are not yet a member!")
        }
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}


export const newreservation = async(req, res)=>{
    try{
        const event = req.body
        reservationevent(event.eventid, event.userid)
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
    
}

export const showpendingres = async (req, res) =>{
    try{
        const pendingres = showpendingreservation()
        res.status(200).json({data: pendingres, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const acceptRes = async(req, res)=>{
    try{
        resid = req.body
        acceptreservation(resid)
        res.status(200).json({ message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const rejectRes = async(req, res)=>{
    try{
        residrej = req.body
        rejectreservation(residrej)
        res.status(200).json({ message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const showAllEvents = async(req,res)=>{
    try{
        const allevents = showallevents()
        res.status(200).json({data: allevents, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const showPublicEvents = async(req,res)=>{
    try{
        const pubevents = showpublicevents()
        res.status(200).json({data: pubevents, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const showPrivateEvents = async(req,res)=>{
    try{
        const prevents = showprivateevents()
        res.status(200).json({data: prevents, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}