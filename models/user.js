import {Sequelize} from 'sequelize'
import sequelize from '../config/index.js'

const User = sequelize.define("users" ,{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
    },
    username:{ 
      type:  Sequelize.STRING,
      unique:true,
      allowNull: false
    },
    password:{ 
        type:  Sequelize.STRING
      },
    first_name:{ 
        type:  Sequelize.STRING
      },
    last_name:{ 
        type:  Sequelize.STRING
      },
})
// User.sync()
export default User