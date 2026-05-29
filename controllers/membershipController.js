import express, { response } from 'express'
import { newmembership, show_pendingMemberships, apprmember, rejmember, show_approvedMemberships, searchmemberships, searchclubs} from '../models/mydatabase.js'


export const joinclub = async(req, res)=>{
    try{
        const newmembership = req.body
        await newmembership(newmembership.clubid, newmembership.userid)
        res.status(200).json({message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const pendingMemberships = async(req, res)=>{
    try{
        const pendingmemberships = await show_pendingClubs()
        res.status(200).json({data: pendingmemberships, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const acceptMember = async(req, res)=>{
    try{
        const newmemberid = req.body
        await apprmember(newmemberid)
        res.status(200).json({message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const rejectMember = async(req, res)=>{
    try{
        const rejectedmemberid = req.body
        await rejmember(rejectedmemberid)
        res.status(200).json({message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const showMembers = async(req, res)=>{
    try{
        const members =await show_approvedMemberships()
        res.status(200).json({data: members, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const usmemberships = async(req, res)=>{
    try{
        const useridm = req.body
        const userscl =await searchmemberships(useridm)
        res.status(200).json({data: userscl, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}
