import { json } from "express"
import sequelize from "../models/user.js"
import User from "../models/user.js"

// const findById = async(req,res)=> {
//     const users = await sequelize.models.user.findById()
//     res,json(users)
// }


// export default {findById}
export async function create (username,first_name,last_name,password){ 
    
     const user = await User.create({
            username:username,
            first_name:first_name,
            last_name:last_name,
            password:password
        }) 
        // .then(res=>{
        //     console.log(res)
        // }).catch((error)=>{
        //     console.error("failed",error)
        // })
    return user
}

export async function findByUsername (username){
   const password = await User.findAll({
            where:{
                username:username
            }
        })
    return password
}

export async function findById (id) {
    const userInfo = await User.findAll({
        attributes:{exclude:["password"]},
        where: {
            id:id
        }
    }
    )
    // console.log(userInfo)
    return userInfo
}

export async function update(id,first_name,last_name,password) {
    if(password==null&&last_name==null&&first_name==null){
        return false
    }
    const userToBeUpdate = await findById(id)
    // console.log(userToBeUpdate)
    userToBeUpdate[0].update({
        first_name:first_name,
        last_name:last_name,
        password,password
    })
    // if(first_name!=null){
    //     userToBeUpdate.first_name=first_name
    //     await userToBeUpdate.save()
    // }
    // if(last_name!=null){
    //     userToBeUpdate.last_name = last_name
    //     await userToBeUpdate.save()
    // }
    // if(password!= null){
    //     userToBeUpdate.password = password
    //     await userToBeUpdate.save()
    // }
    return true
}
// export default create;
// const res = await findById(11)
// console.log(res)