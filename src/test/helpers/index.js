const MongodbMemoryServer = require('mongodb-memory-server').default
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const faker = require('faker')
const koaRequest = require('./koa-request')

const app = require('../../app')

const User = mongoose.model('User')

// Setup
// https://github.com/avajs/ava/blob/master/docs/recipes/endpoint-testing-with-mongoose.md
// https://github.com/zellwk/ava/blob/8b7ccba1d80258b272ae7cae6ba4967cd1c13030/docs/recipes/endpoint-testing-with-mongoose.md
// https://github.com/zellwk/ava-mdb-test/tree/master/test

// Start MongoDB instance
const mongod = new MongodbMemoryServer()

const before = async(t) => {
  const uri = await mongod.getConnectionString()
  await mongoose.connect(uri, { useMongoClient: true })
}

const beforeEach = async(t) => {
  t.context.app = app.server.listen()
}

const beforeEachAuthedUser = async(t) => {
  const currentUser = new User({
    provider: 'local',
    email: faker.internet.email(),
    username: faker.name.firstName(),
  })
  currentUser.setPassword('password')
  await currentUser.save()
  currentUser.token = currentUser.generateJWT()
  t.context.currentUser = currentUser
}

const afterEach = () => {}

const afterEachAuthedUser = () => User.remove()

const after = () => {
  mongoose.disconnect()
  mongod.stop()
}

module.exports = {
  before,
  beforeEach,
  beforeEachAuthedUser,
  afterEach,
  afterEachAuthedUser,
  after,
  koaRequest,
}
