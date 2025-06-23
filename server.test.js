const request = require('supertest');
const app = require('./server'); // Assuming your express app is exported from server.js

describe('GET /', () => {
  it('responds with 200 OK', (done) => {
    request(app)
      .get('/')
      .expect(200, done);
  });
});
