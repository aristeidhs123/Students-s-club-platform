import express, { response } from 'express'
import {createuser, editprofile, turntomanager, showprofile} from '../models/mydatabase.js'
import bcrypt from 'bcrypt'


export const createNewuser = async(req, res)=> {
    try{
        const newuserd = req.body
        const userpswrs = newuserd.password
        const salt = 10
        const cryptopassword = await bcrypt.hash(userpswrs, salt)
        newuser(newuserd.name, newuserd.lastname, newuserd.email, cryptopassword) 
        res.status(200).json({message:"success"})
    }
    catch(error){
        console.error(error)
    }
}

export const login = async(req, res)=> {
    try{
        const user = req.body
        const databaseuser = await searchuser(user.useremail)
        if(databaseuser){
            const checkpassword = await bcrypt.compare(user.userpassword, databseuser.us_password)
            if(!checkpassword){
                console.log("wrong password")
            }
            else{
                console.log("SUCCES LOG IN")
                req.session.databaseuser = {
                    id : databaseuser.us_id,
                    name: databaseuser.us_name
                }
                
                res.send('created a session')
            }
        }
        else{
            console.log("wrong email")
        }
    }
    catch(error){
        console.error(error)
        res.status(500).json({error: "HELP"})
    }
}

export const returnUser = async(req, res)=> {
    try{
        res.status(200).json({data: databaseuser, message:"success"})
    }
    catch(error){
        res.status(500).json({error: "something went wrong retrieving data"})
    }
}