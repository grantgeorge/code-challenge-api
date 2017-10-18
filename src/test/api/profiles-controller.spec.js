const test = require('ava')
const request = require('supertest')
const faker = require('faker')

const User = require('models/User')

const {
  before,
  beforeEach,
  beforeEachAuthedUser,
  afterEachAuthedUser,
  after,
} = require('../helpers')

test.before(before)
test.beforeEach(beforeEach)
test.beforeEach(beforeEachAuthedUser)
test.afterEach(afterEachAuthedUser)
test.after.always(after)

test.beforeEach(async(t) => {
  const user = new User({
    provider: 'local',
    email: faker.internet.email(),
    password: 'password',
    username: faker.name.firstName(),
  })
  t.context.user = await user.save()
})

test.serial('get a profile', async(t) => {
  const { app, user } = t.context
  const res = await request(app).get(`/api/profiles/${user.username}`)
  t.is(res.status, 200)
  t.is(res.body.profile.email, user.email)
  t.is(res.body.profile.userame, user.userame)
})

test.serial('create a profile follow', async(t) => {
  const { app, user, currentUser } = t.context
  const res = await request(app)
    .post(`/api/profiles/${user.username}/follow`)
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')
  t.is(res.status, 200)
  t.is(res.body.profile.following, true)
})

test.serial('delete a profile follow', async(t) => {
  const { app, user, currentUser } = t.context
  const res = await request(app)
    .delete(`/api/profiles/${user.username}/follow`)
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')
  t.is(res.status, 200)
  t.is(res.body.profile.following, false)
})
