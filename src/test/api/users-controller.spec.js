const test = require('ava')
const request = require('supertest')
const faker = require('faker')

const {
  before,
  beforeEach,
  after,
  beforeEachAuthedUser,
  afterEachAuthedUser,
} = require('../helpers')

test.before(before)
test.beforeEach(beforeEach)
test.after.always(after)

test.serial('register a new user', async(t) => {
  const { app } = t.context
  let email = faker.internet.email().toLowerCase()
  const res = await request(app)
    .post(`/api/users`)
    .send({
      user: {
        email,
        password: 'password',
        username: faker.name.firstName(),
      },
    })
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.is(res.body.user.email, email)
  t.not(res.body.user.token, undefined)
})

test.beforeEach(beforeEachAuthedUser)

test.afterEach(afterEachAuthedUser)

test.serial('login an existing user', async(t) => {
  const { app, currentUser } = t.context
  const res = await request(app)
    .post(`/api/users/login`)
    .send({
      user: {
        username: currentUser.username,
        email: currentUser.email,
        password: 'password',
      },
    })
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.is(res.body.user.email, currentUser.email)
  t.not(res.body.user.token, undefined)
})

test.serial('get user profile', async(t) => {
  const { app, currentUser } = t.context
  const res = await request(app)
    .get('/api/user')
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.is(res.body.user.email, currentUser.email)
  t.not(res.body.user.token, currentUser.undefined)
})

test.serial('update current user', async(t) => {
  const { app, currentUser } = t.context
  let newEmail = faker.internet.email().toLowerCase()
  const res = await request(app)
    .put('/api/user')
    .send({
      user: {
        email: newEmail,
      },
    })
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.is(res.body.user.email, newEmail)
  t.not(res.body.user.token, currentUser.undefined)
})
