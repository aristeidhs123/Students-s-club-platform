import express, { response } from 'express'
import { newmembership, show_pendingMemberships, apprmember, rejmember, show_approvedMemberships} from '../models/mydatabase.js'


export const joinclub = async(req, res)=>{
    try{
        const newmembership = req.body
        newmembership(newmembership.clubid, newmembership.userid)
        res.status(200).json({message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const pendingMemberships = async(req, res)=>{
    try{
        const pendingmemberships = show_pendingClubs()
        res.status(200).json({data: pendingmemberships, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const acceptMember = async(req, res)=>{
    try{
        const newmemberid = req.body
        apprmember(newmemberid)
        res.status(200).json({message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const rejectMember = async(req, res)=>{
    try{
        const rejectedmemberid = req.body
        rejmember(rejectedmemberid)
        res.status(200).json({message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}

export const showMembers = async(req, res)=>{
    try{
        const members = show_approvedMemberships()
        res.status(200).json({data: members, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}