import sequelize from '../models/product.js'
import Product from '../models/product.js'

export async function createProduct (name,description,sku,manufacturer,quantity,owner_user_id){ 
          const newOne =  await Product.create({
                    name:name,
                    description:description,
                    sku:sku,
                    manufacturer:manufacturer,
                    quantity:quantity,
                    owner_user_id:owner_user_id
                })
            return newOne
}

export async function findProductById(id){
   const productInfo = await Product.findAll({
        where:{
            id : id
        }
    })
    return productInfo
}

export async function updateProduct(id,name,description,sku,manufacturer,quantity) {
    const productInfo = await Product.findAll({
        where:{
            id : id
        }
    })
    await  productInfo[0].set({
        name:name,
        description:description,
        sku:sku,
        manufacturer:manufacturer,
        quantity:quantity
    })
    await productInfo[0].save()
    // if(name != null){
    //     productInfo.name = name
    //     await productInfo.save()
    // }
    // if(name != null){
    //     productInfo.name = name
    //     await productInfo.save()
    // }
    // if(name != null){
    //     productInfo.name = name
    //     await productInfo.save()
    // }
    // if(name != null){
    //     productInfo.name = name
    //     await productInfo.save()
    // }
    // if(name != null){
    //     productInfo.name = name
    //     await productInfo.save()
    // }
}

export async function deleteProduct(id){
    const productInfo = await Product.findAll({
        where:{
            id : id
        }
    })
    await productInfo[0].destroy();
}
// const test = await updateProduct(2,'1','1','1','1','1')
// console.log(test)
