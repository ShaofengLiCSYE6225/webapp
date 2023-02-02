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
        res.status(401).set('WWW-Authenticate','Basic').json({msg:"Unauthenticated"})
        next(err)
    }else {
        var credentials = Buffer.from(req.get('Authorization').split(' ')[1],'base64')
        .toString()
        .split(':')
        var username = credentials[0]
        var password = credentials[1]
        
        
        const psd = await getPassword(username)
        // const psdObj = JSON.stringify(psd)
        const check = await bcrypt.compare(password,psd[0].password)
        //if not valid
        if(psd[0].id!=req.params.userId){
            // console.log(psd)
            // console.log(password)
            var err  = new Error('Forbidden')
            //set status
            res.status(403).set('WWW-Authenticate','Basic').json({msg:"Forbidden"})
            next(err)
        }
        if (!check){
            var err = new Error('Unauthorized')
            res.status(401).set('WWW-Authenticate','Basic').json({msg:"Unauthorized"})
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
        res.status(201).json(data)
          
    } catch (error) {
        res.status(403).json({msg:"Forbidden"})
    }
    
})
//authenticated user update user's account information
app.put('/v1/user/:userId',authenticate,async(req,res)=>{
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        const {first_name,last_name,password} = req.body
        const id = req.params.userId
        const data = await update(first_name,last_name,hashedPassword,id)
        if (data != false){
            res.status(201).json({msg:data})
        } else {
            res.status(204).json({msg:'No content'})
        }
    } catch (error) {
        res.status(400).json({msg:'Bad Request'})
    }
})


// create a user account
// public
app.post('/v1/user',async(req,res)=>{
    try {
        const {first_name,last_name,password,username} = req.body
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password,salt)
        if(req.body.first_name==null||req.body.last_name==null||req.body.password==null){
            res.status(400).json({msg:"Bad Request"});    
        }
        const valid = username.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)
        if(valid!=null){
            const note  = await createNote(first_name,last_name,hashedPassword,username)
            delete note.password
            res.status(201).json(note)
        } else {
            res.json({msg:'email problem'})
        }
    } catch (error) {
        res.status(400).json({msg:"Bad Request"})  
    }
})
// app.get('/notes',async(req,res)=>{
//     const notes = await getData()
//     res.status(201).json(notes)
// })
// app.get('/notes/:id',async(req,res)=>{
//     const id = req.params.id
//     const note = await getNote1(id)
//     res.status(201).send(note)
// })
// app.post('/users', async(req,res)=>{
//     try{
//         const salt = await bcrypt.genSalt(10)
//         const hashedPassword = await bcrypt.hash(req.body.password,salt)
//         console.log(salt)
//         console.log(hashedPassword)
//         const user = {name:req.body.name,password:hashedPassword}
//         users.push(user)
//         res.status(201).send(user)
//         hash(salt+password)
//     }catch{
//         res.status(500).send()
//     }
    
// })
// app.post('/users/login',async(req,res) => {
//     const user = users.find(user=>user.name = req.body.name)
//     if(user== null) {
//         return res.status(400).send('Cannot find user')
//     }
//     try{
//         if(await bcrypt.compare(req.body.password,user.password)){
//             res.send('Success')
//         } else {
//             res.json({msg:""})
//         }
//     }catch{
//         res.status(500).send()
//     }
// })
export const server = app.listen(3000)