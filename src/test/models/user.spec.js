const test = require('ava')
const User = require('models/User')
const faker = require('faker')

const { before, after } = require('../helpers')

test.before(before)
test.after.always(after)

let user

const genUser = async() => {
  return new Promise((resolve, reject) => {
    user = new User({
      provider: 'local',
      email: faker.internet.email(),
      password: faker.internet.password(),
      username: faker.name.firstName(),
    })
    return resolve(user)
  })
}

test.before(async(t) => {
  await User.remove()
})

test.beforeEach(async(t) => {
  await genUser()
})

test.afterEach.always(async(t) => {
  await User.remove()
})

test.serial(`It should begin with no users`, async(t) => {
  let users = await User.find()
  t.is(users.length, 0)
})

test.serial(
  `It should fail when saving a duplicate email for user`,
  async(t) => {
    await user.save()
    let anotherUser = await new User({
      provider: 'local',
      email: user.email,
      password: user.password,
      username: faker.name.firstName(),
    })

    const error = await t.throws(anotherUser.save())

    t.is(
      error.message,
      `User validation failed: email: Error, expected \`email\` to be unique. Value: \`${user.email}\``
    )
    const users = await User.find()

    t.is(users.length, 1)
  }
)

test.serial(`[email] should fail when saving with a blank email`, async(t) => {
  user.email = ''
  const error = await t.throws(user.save())
  t.is(error.message, "User validation failed: email: can't be blank")
})
