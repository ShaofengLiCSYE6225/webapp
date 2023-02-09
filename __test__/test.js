const request = require('supertest')
import sequelize from '../config/index.js';
import {server} from '../server.js';


test('should return a respond code of 200', async() => { 
    const respond = await request("http://localhost:3001").get("/healthz")
    expect (respond.statusCode).toBe(200)
    await sequelize.sync()
    await server.close();
 })