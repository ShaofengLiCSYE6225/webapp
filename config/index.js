import {Sequelize} from 'sequelize'
import dotenv from 'dotenv'
import logger from '../log.js'
dotenv.config()
const{
    DATABASE_NAME ,//'webapp'
    DATABASE_USERNAME  ,
    DATABASE_PASSWORD,
    DIALECT 
    // DATABASE_NAME = 'assignment2' ,//'webapp'
    // DATABASE_USERNAME = 'root' ,
    // DATABASE_PASSWORD = '12345678',
    // DIALECT 
} = process.env


const  sequelize = new Sequelize(DATABASE_NAME,DATABASE_USERNAME,DATABASE_PASSWORD,{
    dialect:DIALECT,
    logging:(message) => {logger.info(message)}
    // host: process.env.DATABASE_HOST
})

// sequelize.authenticate().then(()=>{
//     console.log('connected')
// }).catch((error)=>{
//     console.log('Unable',error)
// })

export default sequelize