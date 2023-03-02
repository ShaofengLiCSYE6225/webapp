import sequelize from '../models/image.js'
import Image from "../models/image.js";

export async function createImage(product_id,file_name,s3_bucket_path){
   try {
    const newImage = await Image.create({
        // image_id:image_id,
        product_id:product_id,
        file_name:file_name,
        s3_bucket_path:s3_bucket_path,
    })
    return newImage
   } catch (error) {
    console.log(error)
   }
    
    
}

export async function findImageById(image_id,product_id){
    const ImageInfo = await Image.findAll({
        where:{
            image_id:image_id,
            product_id:product_id
        }
    })
    return ImageInfo
}

export async function findImageAll(product_id) {
    const List = await Image.findAll({
            product_id:product_id
        
    })
    return List
}

export async  function deleteImageById(image_id,product_id) {
    try {
        const productInfo = await findImageById(image_id,product_id)
        await productInfo[0].destroy()     
    } catch (error) {
        console.log(error)
    }
   
}

// const testCreate = await createImage(4,"test1","https://lishaofeng-test-bucket.s3.us-east-1.amazonaws.com/Screenshot%202023-02-24%20at%2011.31.58%20AM.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQVNLOXKSK3R3X4D6%2F20230302%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20230302T051409Z&X-Amz-Expires=60&X-Amz-Signature=e6d007bfa3b47fe340bc926ba6f2f64135c5646aad7a7aba2c7ce00a8491b21a&X-Amz-SignedHeaders=host&x-id=GetObject")
// const test = await findImageAll(4);
// console.log(test)
