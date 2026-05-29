import express, { response } from 'express'
import {newprannouncements, newpublannouncements, showpublicannnouncements, showprclubannouncements, returnusrole} from '../models/mydatabase.js'


export const newprivateannouncement = async(req, res)=> {
    try{
        const newann = req.body
        newprannouncements(newann.clubid, newann.userid, newann.title, newann.descr) 
        res.status(200).json({message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}


export const newpublicannouncment = async(req, res)=>{
    try{
        const newpubann = req.body
        if(returnusrole(newpubann.managerid) === 'manager'){
            newpublannouncements(newpubann.manageridann, newpubann.description, newpubann.title) 
            res.status(200).json({message:"success"})
        }
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }
}


export const showallpubannounc = async(req, res)=>{
    try{
        const approvedclubs = showpublicannnouncements()
        res.status(200).json({data: approvedclubs, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "HELP"})
    }

}