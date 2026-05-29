import express, { response } from 'express'
import {club, rejectclub, acceptclub, showclubs, show_pendingClubs, turntomanager, newmembership, show_pendingMemberships} from '../models/mydatabase.js'


export const createNewclub = async(req, res)=> {
    try{
        const newclub = req.body
        newfoodadd(newclub.title, newclub.description, newclub.managerid) //εδω πρεπει να μπει το manager id που θα παρουμε απο το log in session
        res.status(200).json({message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const rejectClub = async(req, res)=>{
    try{
        const clubidrej = req.body
        rejectclub(clubidrej)
        res.status(200).json({message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }

}

export const acceptClub = async(req, res)=>{
    try{
        const clubidaccepted = req.body
        acceptclub(clubidaccepted.club_id)
        turntomanager(clubidaccepted.manager_id)
        res.status(200).json({message:"success"})
        
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }

}


export const showallClub = async(req, res)=>{
    try{
        const approvedclubs = showclubs()
        res.status(200).json({data: approvedclubs, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }

}

export const showpendingClub = async(req, res)=>{
    try{
        const pendingclubs = show_pendingClubs()
        res.status(200).json({data: pendingclubs, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }

}





