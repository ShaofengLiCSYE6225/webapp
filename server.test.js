const request = require('supertest')
const server = require("./server.js")

// test('should first', () => { expect(server.) })
test('Should return a response code of 200',async()=>{
    const response = await request("http://localhost:3000").get('/healthz');
    expect(response.statusCode).toBe(200);
})
