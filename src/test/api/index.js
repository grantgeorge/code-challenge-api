const mongoose = require('mongoose')
const test = require('ava')
const app = require('../../app')
const { koaRequest } = require('../helpers')
const Post = mongoose.model('Post')
const User = mongoose.model('User')

test(`GET invalid route`, async(t) => {
  const res = await koaRequest(app).get('/api/invalid')

  t.is(404, res.status)
})

// test(`GET /api/posts`, async(t) => {
//   const res = await koaRequest(app).get('/api/posts')
//
//   t.is(200, res.status)
// })

// let user
// let post
//
// test.beforeEach(async(t) => {
//   user = await User.findById('59e63205254cdf3c05a297c2')
//   post = await Post.create({
//     body: 'sup',
//     author: user,
//   })
// })
//
// test(`GET /api/posts/:id`, async(t) => {
//   const res = await koaRequest(app).get(`/api/posts/${post._id}`)
//
//   t.is(200, res.status)
// })

// test(`GET /api/posts`, async(t) => {
//   const res = await koaRequest(app).get('/api/posts')
//
//   t.is(200, res.status)
// })
