import express from 'express'
// const express =  require('express')
const app = express()
import bcrypt ,{hash} from 'bcrypt'
// import { getData,getDataById,createNote,update,getPassword} from './database.js'
import sequelize from './models/index.js'
import {create,findByUsername,findById,update} from './controllers/user.js'
import {createProduct,findProductById, updateProduct,deleteProduct} from './controllers/product.js'
// import User from './routes/user.js'
// import user from './controllers/user.js'
// require('dotenv').config()
// const cors = require('cors')
 // const bcrypt = require('bcrypt')
// const { hash } = require('bcrypt')

sequelize.sync()
// sequelize.authenticate().then(() => {
//     console.log('connect')
// }).catch((error)=> {
//     console.error('unable',error)
// })
app.use(express.json())


// var corOptions = {
//     origin:'https://localhost:8080'
// }

// app.use(cors(corOptions))
app.use(express.urlencoded({extended:true}))


//Health endpoints, unauthenticated
app.get('/healthz',(req,res)=>{
    res.status(200).send()
})
// authenticated functions
const authenticate = async(req,res,next)=>{
    if(!req.get('Authorization')){
        var err= new Error('Not Authenticated')
        //
        res.status(401).set('WWW-Authenticate','Basic').json()
        next(err)
    }else {
        var credentials = Buffer.from(req.get('Authorization').split(' ')[1],'base64')
        .toString()
        .split(':')
        var username = credentials[0]
        var password = credentials[1]
        
        
        const psd = await findByUsername(username)
        // const psdObj = JSON.stringify(psd)
        const check = await bcrypt.compare(password,psd[0].dataValues.password)
        // console.log(psd[0].dataValues.id)
        // console.log(req.params.userId)
        //if not valid
        if(psd[0].dataValues.id!=req.params.userId){
            // console.log(psd)
            // console.log(password)
            var err  = new Error('Forbidden')
            //set status
            res.status(403).set('WWW-Authenticate','Basic').json()
            next(err)
        }
        if (!check){
            var err = new Error('Unauthorized')
            res.status(401).set('WWW-Authenticate','Basic').json()
            next(err)
        }
        res.status(200)
        next()
    }
}

const authenticateProductUpdate = async(req,res,next)=>{
   try{
    if(!req.get('Authorization')){
            var err= new Error('Not Authenticated')
            res.status(401).set('WWW-Authenticate','Basic').json({msg:"Unauthenticated"})
            next(err)
        }else {
            var credentials = Buffer.from(req.get('Authorization').split(' ')[1],'base64')
            .toString()
            .split(':')
            var username = credentials[0]
            var password = credentials[1]
            
            
            const psd = await findByUsername(username)
            // console.log(psd[0])
            // const psdObj = JSON.stringify(psd)
            const check = await bcrypt.compare(password,psd[0].dataValues.password)
            // console.log(psd[0].dataValues.id)
            // console.log(req.params.userId)
            //if not valid
            const productInfo = await findProductById(req.params.productId)
            const productOwner = productInfo[0].dataValues.owner_user_id
            if(psd[0].dataValues.id!=productOwner){
                // console.log(psd)
                // console.log(password)
                var err  = new Error('Forbidden')
                // set status
                res.status(403).set('WWW-Authenticate','Basic').json()
                next(err)
            }
            if (!check){
                var err = new Error('Unauthorized')
                res.status(401).set('WWW-Authenticate','Basic').json()
                next(err)
            }
            res.status(200)
            next()
        }
    } catch(error){
        res.status(401).send()
    }
}

const authenticateProduct = async(req,res,next)=>{
    try {
        if(!req.get('Authorization')){
            var err= new Error('Not Authenticated')
            //
            res.status(401).set('WWW-Authenticate','Basic').send()
            next(err)
        }else {
            var credentials = Buffer.from(req.get('Authorization').split(' ')[1],'base64')
            .toString()
            .split(':')
            var username = credentials[0]
            var password = credentials[1]
            
            
            const psd = await findByUsername(username)
            // const psdObj = JSON.stringify(psd)
            const check = await bcrypt.compare(password,psd[0].dataValues.password)
            // console.log(psd[0].dataValues.id)
            // console.log(req.params.userId)
            //if not valid
            // if(psd[0].dataValues.id!=req.params.userId){
                // console.log(psd)
                // console.log(password)
                // var err  = new Error('Forbidden')
                //set status
                // res.status(403).set('WWW-Authenticate','Basic').json({msg:"Forbidden"})
                // next(err)
            // }
            if (!check){
                var err = new Error('Unauthorized')
                res.status(401).set('WWW-Authenticate','Basic').send()
                next(err)
            }
            // res.status(200).send()
            next()
        }    
    } catch (error) {
        res.status(401).send()
    }
    
}


//authenticated get user account information
app.get('/v1/user/:userId',authenticate,async(req,res)=>{
    try {
        const id = req.params.userId 
        const data = await findById(id)
        res.status(201).json(data)
          
    } catch (error) {
        res.status(403).json()
    }
    
})
//authenticated user update user's account information
app.put('/v1/user/:userId',authenticate,async(req,res)=>{
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        const {first_name,last_name,password,username} = req.body
        if(password!=null&&first_name!=null&&last_name!=null&&username==null){
            const id = req.params.userId    
            const data = await update(id,first_name,last_name,hashedPassword)
            res.status(204).json()    
        }
        res.status(400).send()
    } catch (error) {
        res.status(400).json()
    }
})


// create a user account
// public
app.post('/v1/user',async(req,res)=>{
    try {
        const {first_name,last_name,password,username} = req.body
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        if(req.body.first_name==null||req.body.last_name==null||req.body.password==null||req.body.username == null){
            res.status(400).json();    
        } else {
            const valid = username.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)
            if(valid!=null){
                const note  = await create(username,first_name,last_name,hashedPassword)
            // delete note.password
                delete note.dataValues.password
            // const returnUser = await findById(note[0].id)
                res.status(201).json(note)
            } else {
            res.status(400).json()
            }
        }
    } catch (error) {
        res.status(400).send()  
    }
})

// add a new product
app.post('/v1/product',authenticateProduct,async(req,res)=>{
    try {
        const {name, description,sku,manufacturer,quantity} = req.body
        const credentials = Buffer.from(req.get('Authorization').split(' ')[1],'base64')
        .toString()
        .split(':')
        const userInfo = await findByUsername(credentials[0])
        const owner_user_id = userInfo[0].dataValues.id
        if(!Number.isInteger(quantity)){
        res.status(400).send() 
        } else {
        const product = await createProduct(name,description,sku,manufacturer,quantity,owner_user_id)
        res.status(201).json(product)
        }
    } catch (error) {
        res.status(400).send()
    }
    
    
})

app.put('/v1/product/:productId',authenticateProductUpdate,async(req,res)=>{
    try {
        // const credentials = Buffer.from(req.get('Authorization').split(' ')[1],'base64')
        // .toString()
        // .split(':')
        // const userInfo = await findByUsername(credentials[0])
        // const owner_user_id = userInfo[0].dataValues.id
        // // const product = await findProductById(productId)
        // if (owner_user_id === product[0].dataValues.owner_user_id){
            const {name,description,sku,manufacturer,quantity} = req.body
            if(name==null||description==null||sku==null||manufacturer==null||quantity==null||!Number.isInteger(quantity)){
                res.status(400).send()
            } else {
                await updateProduct(req.params.productId,name,description,sku,manufacturer,quantity)
                res.status(204).send()
            }
            // console.log(name)
        // } else {

        // }
        
    } catch (error) {
        res.status(400).send()
    }
})

app.patch('/v1/product/:productId',authenticateProductUpdate,async(req,res)=>{
    try {
        const {name,description,sku,manufacturer,quantity} = req.body
        if(Number.isInteger(quantity)){
            const productInfo = await updateProduct(req.params.productId,name,description,sku,manufacturer,quantity)
            res.status(204).send()
        }
        res.status(400).send()
    } catch (error) {
        res.status(400).send()
    }
})

app.delete('/v1/product/:productId',authenticateProductUpdate,async(req,res)=>{
    try {
        await deleteProduct(req.params.productId)
        res.status(204).send()
    } catch (error) {
        res.status(400).send()
    }
})

app.get('/v1/product/:productId',async(req,res)=>{
    try {
        const productInfo = await findProductById(req.params.productId)
        res.status(200).json(productInfo[0])
    } catch (error) {
        res.status(400).send()
    }
})
export const server = app.listen(3000)