import express from 'express'
// const express =  require('express')
const app = express()
import bcrypt ,{hash} from 'bcrypt'
import { getData,getDataById,createNote,update,getPassword} from './database.js'
// const bcrypt = require('bcrypt')
// const { hash } = require('bcrypt')


app.use(express.json())



//Health endpoints, unauthenticated
app.get('/healthz',(req,res)=>{
    res.status(200).send()
})
// authenticated functions
const authenticate = async(req,res,next)=>{
    if(!req.get('Authorization')){
        var err= new Error('Not Authenticated')
        //
        res.status(401).set('WWW-Authenticate','Basic').send('Unauthorized')
        next(err)
    }else {
        var credentials = Buffer.from(req.get('Authorization').split(' ')[1],'base64')
        .toString()
        .split(':')
        var username = credentials[0]
        var password = credentials[1]
        
        
        const psd = await getPassword(username)
        const psdObj = String(psd['password'])
        const check = bcrypt.compare(password,psdObj)
        //if not valid
        if(!check){
            console.log(psd)
            console.log(password)
            var err  = new Error('Not Authenticated!')
            //set status
            res.status(401).set('WWW-Authenticate','Basic')
            next(err)
        }
        res.status(200)
        next()
    }
}
//authenticated get user account information
app.get('/v1/user/:userId',authenticate,async(req,res)=>{
    try {
        const id = req.params.userId 
        const data = await getDataById(id)
        res.status(201).send(data)
          
    } catch (error) {
        res.status(403).send('Forbidden')
    }
    
})
//authenticated user update user's account information
app.put('/v1/user/:userId',authenticate,async(req,res)=>{
    try {
        const {first_name,last_name,password} = req.body
        const id = req.params.userId
        const data = await update(first_name,last_name,password,id)
        if (data != false){
            res.status(201).send(data)
        } else {
            res.status(204).send('No content')
        }
    } catch (error) {
        res.status(400).send('Bad Request')
    }
})

app.get('/notes',async(req,res)=>{
    const notes = await getData()
    res.status(201).send(notes)
})
app.get('/notes/:id',async(req,res)=>{
    const id = req.params.id
    const note = await getNote1(id)
    res.status(201).send(note)
})
// create a user account
// public
app.post('/v1/user',async(req,res)=>{
    const {first_name,last_name,password,username} = req.body
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password,salt)

    try {
        const valid = username.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)
        if(valid!=null){
            const note  = await createNote(first_name,last_name,hashedPassword,username)
            res.status(201).send(note)
        } else {
            res.send('email problem')
        }
    } catch (error) {
        res.status(400).send('Bad Request')   
    }
})
app.post('/users', async(req,res)=>{
    try{
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        console.log(salt)
        console.log(hashedPassword)
        const user = {name:req.body.name,password:hashedPassword}
        users.push(user)
        res.status(201).send(user)
        hash(salt+password)
    }catch{
        res.status(500).send()
    }
    
})
app.post('/users/login',async(req,res) => {
    const user = users.find(user=>user.name = req.body.name)
    if(user== null) {
        return res.status(400).send('Cannot find user')
    }
    try{
        if(await bcrypt.compare(req.body.password,user.password)){
            res.send('Success')
        } else {
            res.send('Not Allowed')
        }
    }catch{
        res.status(500).send()
    }
})
export const server = app.listen(3000)