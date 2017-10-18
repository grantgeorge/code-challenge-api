const test = require('ava')
const User = require('models/User')
const Post = require('models/Post')
const Comment = require('models/Comment')
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

const genComment = async(t) => {
  let { user, post } = t.context
  let comment = await Comment.create({
    body: faker.hacker.phrase(),
    author: user,
    post: post,
  })
  t.context.comment = comment
}

test.before(async(t) => {
  await User.remove()
  await Post.remove()
  await Comment.remove()
})

test.beforeEach(async(t) => genUser(t))

test.beforeEach(async(t) => genPost(t))

test.beforeEach(async(t) => genComment(t))

test.afterEach.always(async(t) => {
  await User.remove()
  await Post.remove()
  await Comment.remove()
})

test.serial(`should have a valid toJSONFor() method`, async(t) => {
  let { comment, user } = t.context

  let parsed = comment.toJSONFor(user)

  t.is(parsed.id, comment._id)
  t.is(parsed.body, comment.body)
  t.is(parsed.createdAt, comment.createdAt)

  t.is(parsed.author.email, user.email)
  t.is(parsed.author.username, user.username)
})
