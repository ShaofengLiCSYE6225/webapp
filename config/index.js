import {Sequelize} from 'sequelize'
import dotenv from 'dotenv'
dotenv.config()
const{
    DATABASE_NAME ,//'webapp'
    DATABASE_USERNAME  ,
    DATABASE_PASSWORD,
    DIALECT 
} = process.env


const  sequelize = new Sequelize(DATABASE_NAME,DATABASE_USERNAME,DATABASE_PASSWORD,{
    dialect:DIALECT,
    host: process.env.DATABASE_HOST
})

// sequelize.authenticate().then(()=>{
//     console.log('connected')
// }).catch((error)=>{
//     console.log('Unable',error)
// })

export default sequelize