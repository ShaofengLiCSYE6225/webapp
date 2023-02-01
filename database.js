import mysql from 'mysql2'

import dotenv from 'dotenv'
dotenv.config()

export const pool = mysql.createPool({
    host:process.env.MYSQL_HOST,
    user:process.env.MYSQL_USER,
    password:process.env.MYSQL_PASSWORD,
    database:process.env.MYSQL_DATABASE
}).promise()

export async function getData(){
    const [rows] = await pool.query("select distinct id,username,first_name,last_name,account_created,account_updated from test")
    return rows
}

export async function getDataById(id) {
    const [rows] = await pool.query(`
    SELECT 
    id,username,first_name,last_name,account_created,account_updated
    FROM test
    WHERE id = ?`,[id]
    )
    return rows
}

export async function createNote(first_name,last_name,password,username){
    const [result] = await pool.query(`
    insert into test (first_name,last_name,password,username) values (?,?,?,?)`,[first_name,last_name,password,username])
    return {
        id:result.insertId,
        first_name,
        last_name,
        password,
        username
    }
}
export async function update(first_name,last_name,password,id){
    // const date = new Date().toISOString().slice(0,19).replace('T',' ')
    
        const [result] = await pool.query(`
        UPDATE test SET first_name = ?,last_name = ?, password =? WHERE id = ?
        `, [first_name,last_name,password,id])
        if(result!=null){
            // console.log(result)
            return true
        }
        // console.log(result)
        return false
        
}
export async function getPassword(username){
    const [result] = await pool.query(`SELECT
    password 
    FROM test
    WHERE username =?`,[username])
    return result
}
// const res = await getPassword ('jd@123.com')
// console.log(res)