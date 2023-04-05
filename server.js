import express from 'express'
import multer from 'multer'
// const express =  require('express')
const app = express()
import bcrypt ,{hash} from 'bcrypt'
// import { getData,getDataById,createNote,update,getPassword} from './database.js'
import sequelize from './models/index.js'
import {create,findByUsername,findById,update} from './controllers/user.js'
import {createProduct,findProductById, updateProduct,deleteProduct} from './controllers/product.js'
import {createImage,findImageById,findImageAll,deleteImageById} from './controllers/image.js'
import{S3Client,PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from "@aws-sdk/client-s3"
import dotenv from 'dotenv'
import logger from './log.js'
import client from './config/statsd.js'
dotenv.config()

const bucketName= process.env.AWS_BUCKET_NAME
const bucketRegion= process.env.AWS_BUCKET_REGION

const s3 = new S3Client({
    // credentials:{
    //     accessKeyId:process.env.ACCESS_KEY,
    //     secretAccessKey:process.env.SECRET_ACCESS_KEY
    // },
    // bucktname:process.env.BUCKET_NAME,
    region:bucketRegion
})

// import User from './routes/user.js'
// import user from './controllers/user.js'
// require('dotenv').config()
// const cors = require('cors')
 // const bcrypt = require('bcrypt')
// const { hash } = require('bcrypt')

sequelize.sync().then((res)=>{
    console.log("Success")
}).catch((error)=>{
    console.log(error);
})
// await sequelize.close()
// sequelize.authenticate().then(() => {
//     console.log('connect')
// }).catch((error)=> {
//     console.error('unable',error)
// })
const storage = multer.memoryStorage()
const upload = multer({storage:storage})


app.use(express.json())


// var corOptions = {
//     origin:'https://localhost:8080'
// }

// app.use(cors(corOptions))
// app.use(express.urlencoded({extended:true}))


//Health endpoints, unauthenticated
app.get('/healthz',(req,res)=>{
    try {
        client.increment('healthz')
        logger.info("Connection health")
        res.status(200).send()
    } catch (error) {
        logger.error(error)
    }
})
// authenticated functions
const authenticate = async(req,res,next)=>{
    if(!req.get('Authorization')){
        var err= new Error('Not Authenticated')
        //
        logger.error(err)
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
            logger.error(err)
            res.status(403).set('WWW-Authenticate','Basic').json()
            next(err)
        }
        if (!check){
            var err = new Error('Unauthorized')
            logger.error(err)
            res.status(401).set('WWW-Authenticate','Basic').json()
            next(err)
        }
        logger.info("Authenticated")
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
            // console.log(productInfo[0])
            if (typeof(productInfo[0]) === "undefined") {
                var err = new Error('Not Found')
                logger.error(err)
                res.status(404).send()
            }
            const productOwner = productInfo[0].dataValues.owner_user_id
            if(psd[0].dataValues.id!=productOwner){
                // console.log(psd)
                // console.log(password)
                var err  = new Error('Forbidden')
                // set status
                res.status(403).set('WWW-Authenticate','Basic').json()
                logger.error(err)
                next(err)
            }
            if (!check){
                var err = new Error('Unauthorized')
                res.status(401).set('WWW-Authenticate','Basic').json()
                logger.error(err)
                next(err)
            }
            logger.info("Authenticated")
            res.status(200)
            next()
        }
    } catch(error){
        logger.error(error)
        res.status(401).send()
    }
}

const authenticateProduct = async(req,res,next)=>{
    try {
        if(!req.get('Authorization')){
            var err= new Error('Not Authenticated')
            //
            logger.error(err)
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
                logger.error(err)
                res.status(401).set('WWW-Authenticate','Basic').send()
                next(err)
            }
            // res.status(200).send()
            next()
        }    
    } catch (error) {
        logger.error(error)
        res.status(401).send()
    }
    
}


//authenticated get user account information
app.get('/v1/user/:userId',authenticate,async(req,res)=>{
    try {
        client.increment('GET USER')
        const id = req.params.userId 
        const data = await findById(id)
        logger.info( 'GET user information')
        
        res.status(201).json(data)
          
    } catch (error) {
        logger.error(error)
        res.status(403).json()
    }
    
})
//authenticated user update user's account information
app.put('/v1/user/:userId',authenticate,async(req,res)=>{
    try {
        client.increment('UPDATE USER')
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        const {first_name,last_name,password,username} = req.body
        if(password!=null&&first_name!=null&&last_name!=null&&username==null){
            const id = req.params.userId    
            const data = await update(id,first_name,last_name,hashedPassword)
            logger.info("Update user's account")
            
            res.status(204).json()    
        }
        logger.error("Input user's account information error")
        res.status(400).send()
    } catch (error) {
        logger.error(error)
        res.status(400).json()
    }
})


// create a user account
// public
app.post('/v1/user',async(req,res)=>{
    try {
        client.increment('CREATE USER')
        const {first_name,last_name,password,username} = req.body
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        if(req.body.first_name==null||req.body.last_name==null||req.body.password==null||req.body.username == null){
            logger.error("Request body error")
            res.status(400).json();    
        } else {
            const valid = username.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)
            if(valid!=null){
                const note  = await create(username,first_name,last_name,hashedPassword)
            // delete note.password
                delete note.dataValues.password
            // const returnUser = await findById(note[0].id)
                logger.info("Create a user account")
                
                res.status(201).json(note)
            } else {
                logger.error("username invalid")
            res.status(400).json()
            }
        }
    } catch (error) {
        logger.error(error)
        res.status(400).send()  
    }
})

// add a new product
app.post('/v1/product',authenticateProduct,async(req,res)=>{
    try {
        client.increment('CREATE PRODUCT')
        const {name, description,sku,manufacturer,quantity} = req.body
        const credentials = Buffer.from(req.get('Authorization').split(' ')[1],'base64')
        .toString()
        .split(':')
        const userInfo = await findByUsername(credentials[0])
        const owner_user_id = userInfo[0].dataValues.id
        // console.log(!String.isString(name))
        // console.log(1)
        if(!Number.isInteger(quantity)){
        logger.error("Number is not an integer")
        res.status(400).send() 
        } else {
        const product = await createProduct(name,description,sku,manufacturer,quantity,owner_user_id)
        logger.info("Create a new product")
        
        res.status(201).json(product)
        }
    } catch (error) {
        logger.error(error)
        res.status(400).send()
    }
    
    
})

app.put('/v1/product/:productId',authenticateProductUpdate,async(req,res)=>{
    try {
        client.increment('UPDATE PRODUCT')
        // const credentials = Buffer.from(req.get('Authorization').split(' ')[1],'base64')
        // .toString()
        // .split(':')
        // const userInfo = await findByUsername(credentials[0])
        // const owner_user_id = userInfo[0].dataValues.id
        // // const product = await findProductById(productId)
        // if (owner_user_id === product[0].dataValues.owner_user_id){
            const {name,description,sku,manufacturer,quantity} = req.body
            if(name==null||description==null||sku==null||manufacturer==null||quantity==null||!Number.isInteger(quantity)){
                logger.error("request body invalid")
                res.status(400).send()
            } else {
                await updateProduct(req.params.productId,name,description,sku,manufacturer,quantity)
                logger.info("Update the product")
                
                res.status(204).send()
            }
            // console.log(name)
        // } else {

        // }
        
    } catch (error) {
        logger.error(error)
        res.status(400).send()
    }
})

app.patch('/v1/product/:productId',authenticateProductUpdate,async(req,res)=>{
    try {
        client.increment('UPDATE PRODUCT')
        const {name,description,sku,manufacturer,quantity} = req.body
        if(Number.isInteger(quantity)){
            const productInfo = await updateProduct(req.params.productId,name,description,sku,manufacturer,quantity)
            logger.info("Update the product")
            
            res.status(204).send()
        }
        logger.error("Quantity is invalid")
        res.status(400).send()
    } catch (error) {
        logger.error(error)
        res.status(400).send()
    }
})

app.delete('/v1/product/:productId',authenticateProductUpdate,async(req,res)=>{
    try {
        client.increment('DELETE PRODUCT')
        const imageInfo = await findImageAll(req.params.productId)
        const len = imageInfo.length
        for (let i = 0; i < len ; i++) {
           const params = {
            Bucket: bucketName,
            Key: `${req.params.productId}/${imageInfo[i].dataValues.file_name}`,
            }  
        const command = new DeleteObjectCommand(params)
        await s3.send(command)
        }
        const Image = await deleteAll(req.params.productId)
        await deleteProduct(req.params.productId)
        logger.info("Delete the product")
        
        res.status(204).send()
    } catch (error) {
        logger.error(error)
        res.status(400).send()
    }
})

app.get('/v1/product/:productId',async(req,res)=>{
    try {
        client.increment('GET PRODUCT')
        const productInfo = await findProductById(req.params.productId)
        logger.info("Get the product information")
        
        res.status(200).json(productInfo[0])
    } catch (error) {
        logger.error(error)
        res.status(400).send()
    }
})

//get list of all images uploaded
app.get('/v1/product/:productId/image',authenticateProductUpdate,async(req,res)=>{
    client.increment('GET IMAGES')
    try {
        const allImage = await findImageAll(req.params.productId)
        logger.info("Get information of images of the product")
        
        // console.log(allImage)
        res.status(200).json(allImage)
    } catch (error) {
        logger.error(error)
        res.status(400).send
    }
})
//upload an image
app.post('/v1/product/:productId/image',authenticateProductUpdate,upload.single('image'),async(req,res)=>{
    client.increment('UPLOAD IMAGE')
    try {
        // console.log("req.body",req.body)
        // console.log("req.file",req.file)
        // const client = new S3Client(clientParams)
        // req.file.buffer
        const randomnumber = Math.random() *100
        const randomNumberString = randomnumber.toString()
        const random = randomNumberString+req.file.originalname  
        const filetype =/jpeg|jpg|png/
        const extname = req.file.originalname
        if (filetype.test(extname.toLowerCase())) {
            const params = {
                Bucket: bucketName,
                Key: `${req.params.productId}/${random}`,
                // Key:req.file.originalname,
                Body: req.file.buffer,
                ContentType : req.file.mimetype
            }
            const commandPut = new PutObjectCommand(params)
            // console.log(0)
            await s3.send(commandPut)
            logger.info("Send the image to the S3 Bucket")
            // console.log(url)
            const result = await createImage(req.params.productId,random,params.Key)
            logger.info("Upload an image successfully")
            res.status(201).send(result)  
        }
        logger.error("File is not an image")
        res.status(400).send()
    } catch (error) {
        logger.error(error)
       res.status(400).json({error:error})
    }
    
})

//get image details
app.get('/v1/product/:productId/image/:image_id',authenticateProductUpdate,async(req,res)=>{
    client.increment('GET IMAGE')
    try {
    const imageInfo = await findImageById(req.params.image_id,req.params.productId);
    if(typeof(imageInfo[0])==="undefined"){
        logger.error("Image not exist")
        
        res.status(403).send()
    }
    logger.info("Get the image details")
    res.status(200).json(imageInfo[0])
   } catch (error) {
    logger.error(error)
    res.status(404).send()
   }
//     const getObjectParams = {
//         Bucket:bucketName,
//         Key:imageInfo[0].dataValues.file_name
//    }
    // const command = new GetObjectCommand(getObjectParams);
    // const url = await getSignedUrl(client, command, { expiresIn: 3600 });
})

//delete the image
app.delete('/v1/product/:productId/image/:image_id',authenticateProductUpdate,async(req,res)=>{
    client.increment('DELETE IMAGE')
    try {
        const imageInfo = await findImageById(req.params.image_id,req.params.productId)
        const params = {
            Bucket: bucketName,
            Key: `${req.params.productId}/${imageInfo[0].dataValues.file_name}`,
        }
        const command = new DeleteObjectCommand(params)
        await s3.send(command)
        logger.info("delete image from S3 Bucket")
        const result = await deleteImageById(req.params.image_id,req.params.productId)
        logger.info("Successfully Deleted")
        
        res.status(204).send()
    } catch (error) {
        logger.error(error)
        res.status(404).send(error)
    }
})
// sequelize.close()
// const app1 = express()
// app1.use(express.json())
// app1.get('/healthz',(req,res)=>{
//     res.status(200).send()
// })

// export const server1 = app.listen(3001)
// logger.error("error")
// logger.warn("warn")
// logger.info("info")
// logger.verbose("verbose")
// logger.debug("debug")
// logger.silly("silly")
// app.listen(3001,async()=>{
//    logger.info("app is running in node：")
// })
export const server = app.listen(3000)