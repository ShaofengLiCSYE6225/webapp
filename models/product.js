import {Sequelize} from 'sequelize'
import sequelize from '../config/index.js'

const Product = sequelize.define('Product',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
    },
    name:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    description:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    sku:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true
    },
    manufacturer:{
        type:Sequelize.STRING,
        allowNull:true
    },
    quantity:{
        type:Sequelize.INTEGER,
        allowNull:false,
        validate:{
            min:0,
            max:100
        }
    },
    owner_user_id:{
        type:Sequelize.INTEGER,
        allowNull:false,
    },
    
        
       

},{createdAt:'date_added',updatedAt:'date_last_updated'})
// Product.sync()
export default Product

// export async function createProduct (name,description,sku,manufacturer,quantity,owner_user_id){ 
        
//         sequelize.sync().then(()=>{
//             Product.create({
//                 name:name,
//                 description:description,
//                 sku:sku,
//                 manufacturer:manufacturer,
//                 quantity:quantity,
//                 owner_user_id:owner_user_id
//             })
//         })
   
// }