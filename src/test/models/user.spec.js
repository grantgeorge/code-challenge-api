const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const test = require('ava')

const app = require('../../app')
const User = mongoose.model('User')

let user

const genUser = async() => {
  return new Promise((resolve, reject) => {
    user = new User({
      provider: 'local',
      name: 'Fake user',
      email: 'test@example.com',
      password: 'password',
    })
    return resolve(user)
  })
}

test.before(async(t) => {
  await User.remove()
})

test.beforeEach(async(t) => {
  genUser()
})

test.afterEach(async(t) => {
  await User.remove()
})

test.after(async(t) => {
  app.server.on('close', () => {})
  mongoose.connection.db.dropDatabase()
  app.server.close()
})

test(`It should begin with no users`, async(t) => {
  let users = await User.find()
  t.is(users.length, 0)
})

test(`It should fail when saving a duplicate user`, async(t) => {
  const user1 = await genUser()
  await user1.save()
  const user2 = await genUser()
  await user2.save()

  const users = await User.find()

  t.is(users.length, 1)
})

// test(`[email] should fail when saving with a blank email`, async(t) => {
//   user.email = ''
//   t.throws(() => user.save().exec())
// })
