import {Sequelize} from 'sequelize'
import sequelize from '../config/index.js'

const Image = sequelize.define('Image',{
    image_id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        allowNull:false,
        autoIncrement:true,
    },
    product_id:{
        type:Sequelize.INTEGER,
        allowNull:false,
    },
    file_name:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    s3_bucket_path:{
        type:Sequelize.STRING,
        allowNull:false,
    }
},{createdAt:'date_created',updatedAt:false})

export default Image