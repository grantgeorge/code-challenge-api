const test = require('ava')
const User = require('models/User')
const Post = require('models/Post')
const faker = require('faker')

const { before, after } = require('../helpers')

test.before(before)
test.after.always(after)

const genUser = async(t) => {
  let user = await User.create({
    provider: 'local',
    email: faker.internet.email(),
    password: faker.internet.password(),
    username: faker.name.firstName(),
  })
  t.context.user = user
}

const genPost = async(t) => {
  let post = await Post.create({
    body: faker.hacker.phrase(),
    author: t.context.user,
  })
  t.context.post = post
}

test.before(async(t) => {
  await User.remove()
  await Post.remove()
})

test.beforeEach(async(t) => genUser(t))

test.beforeEach(async(t) => genPost(t))

test.afterEach(async(t) => {
  await User.remove()
  await Post.remove()
})

test.serial(`Should initialize with zero favorites`, async(t) => {
  let { post } = t.context

  t.is(post.favoritesCount, 0)
})

test.serial(`toJSONFor() method`, async(t) => {
  let { user, post } = t.context
  let postJSON = post.toJSONFor(user)

  t.is(postJSON.id, post._id)
})

test.serial('updateFavoriteCount() method', async(t) => {
  let { user, post } = t.context
  await user.favorite(post.id)
  await post.updateFavoriteCount()
  t.is(post.favoritesCount, 1)
})
