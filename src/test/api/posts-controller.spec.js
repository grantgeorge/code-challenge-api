const test = require('ava')
const request = require('supertest')
const faker = require('faker')

const User = require('models/User') // eslint-disable-line no-unused-vars
const Post = require('models/Post')
const Comment = require('models/Comment')

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
  const post = new Post({
    author: t.context.currentUser,
    body: faker.hacker.phrase(),
  })
  post.id = post._id.toString()
  t.context.post = await post.save()
})

test.serial('get all posts', async(t) => {
  const { app } = t.context
  const res = await request(app).get(`/api/posts`)

  t.is(res.status, 200)
  t.is(res.body.posts.length, 1)
})

test.serial('create a new post', async(t) => {
  const { app, currentUser } = t.context
  let newPost = {
    body: faker.hacker.phrase(),
  }

  const res = await request(app)
    .post(`/api/posts`)
    .send({
      post: newPost,
    })
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.is(res.body.post.body, newPost.body)
  t.not(res.body.post.id, undefined)
})

// TODO: test this more thoroughly, ex:
// test creating posts for user that's not followed by currentUser
test.serial('get post feed', async(t) => {
  const { app, currentUser } = t.context
  const res = await request(app)
    .get(`/api/posts/feed`)
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.is(res.body.posts.length, 0)
})

test.serial('get a post', async(t) => {
  const { app, post } = t.context
  const res = await request(app).get(`/api/posts/${post._id}`)

  t.is(res.status, 200)
  t.is(res.body.post.body, t.context.post.body)
  t.is(res.body.post.id, t.context.post.id)
})

test.serial('update a post', async(t) => {
  const { app, currentUser, post } = t.context
  let updatedPost = {
    body: faker.hacker.phrase(),
  }

  const res = await request(app)
    .put(`/api/posts/${post.id}`)
    .send({
      post: updatedPost,
    })
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.is(res.body.post.body, updatedPost.body)
  t.not(res.body.post.id, undefined)
})

test.serial('delete a post', async(t) => {
  const { app, currentUser, post } = t.context

  const res = await request(app)
    .delete(`/api/posts/${post._id}`)
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')

  t.is(res.status, 204)
})

test.serial('create a post favorite', async(t) => {
  const { app, currentUser, post } = t.context

  const res = await request(app)
    .post(`/api/posts/${post.id}/favorite`)
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.is(res.body.post.favorited, true)
  t.is(res.body.post.favoritesCount, 1)
})

// TODO: this doesn't thoroughly check the favorite and then unfavorite action
test.serial('create a post favorite', async(t) => {
  const { app, currentUser, post } = t.context

  const res = await request(app)
    .post(`/api/posts/${post.id}/favorite`)
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.is(res.body.post.favorited, true)
  t.is(res.body.post.favoritesCount, 1)
})

test.serial('delete a post favorite', async(t) => {
  const { app, currentUser, post } = t.context

  const res = await request(app)
    .del(`/api/posts/${post.id}/favorite`)
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.is(res.body.post.favorited, false)
  t.is(res.body.post.favoritesCount, 0)
})

test.serial('create a post comment', async(t) => {
  const { app, currentUser, post } = t.context
  let newComment = {
    body: faker.hacker.phrase(),
  }

  const res = await request(app)
    .post(`/api/posts/${post.id}/comments`)
    .send({
      comment: newComment,
    })
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.is(res.body.comment.body, newComment.body)
  t.not(res.body.comment.id, undefined)
})

test.beforeEach(async(t) => {
  const { post } = t.context
  const comment = new Comment({
    author: t.context.currentUser,
    body: faker.hacker.phrase(),
    post: post.id,
  })
  comment.id = comment._id.toString()
  t.context.comment = await comment.save()
  post.comments.push(comment)
  t.context.post = await post.save()
})

test.serial('get post comments', async(t) => {
  const { app, post } = t.context

  const res = await request(app)
    .get(`/api/posts/${post.id}/comments`)
    .set('Accept', 'application/json')

  t.is(res.status, 200)
  t.is(res.body.comments.length, 1)
})

test.serial('delete a post comment', async(t) => {
  const { app, comment, currentUser, post } = t.context

  const res = await request(app)
    .del(`/api/posts/${post.id}/comments/${comment.id}`)
    .set('Authorization', `Bearer ${currentUser.token}`)
    .set('Accept', 'application/json')

  t.is(res.status, 204)
})
