const request = require('supertest')

module.exports = (app) => request(app.server.listen())
