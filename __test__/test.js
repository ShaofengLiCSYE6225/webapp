const request = require('supertest')
import {server} from '../server';


test('should return a respond code of 200', async() => { 
    const respond = await request("http://localhost:3000").get("/healthz")
    expect (respond.statusCode).toBe(200)
    // server.close();
 })