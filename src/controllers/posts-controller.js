const mongoose = require('mongoose')
const slug = require('slug')
const humps = require('humps')
const _ = require('lodash')
const Post = mongoose.model('Post')
const User = mongoose.model('User')
// const comments = require('./comments-controller')
const { ValidationError } = require('lib/errors')
const { merge } = require('lodash')

const byId = async(id, ctx, next) => {
  if (!id) {
    ctx.throw(404)
  }

  const post = await Post.findById(id).populate('author')

  if (!post) {
    ctx.throw(404)
  }

  ctx.state.post = post

  await next()
}

const index = async(ctx) => {
  try {
    const { offset, limit, author, favorited } = ctx.query
    const query = {}

    // console.log('user on req: ', user)

    let queries = await Promise.all([
      author ? User.findOne({ username: author }) : null,
      favorited ? User.findOne({ username: favorited }) : null,
    ])

    let thisAuthor = queries[0]
    let favoriter = queries[1]

    if (thisAuthor) {
      query.author = author._id
    }

    if (favoriter) {
      query._id = { $in: favoriter.favorites }
    } else if (favorited) {
      query._id = { $in: [] }
    }

    let results = await Promise.all([
      Post.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({ createdAt: 'desc' })
        .populate('author'),
      Post.count(query),
      ctx.state.user ? ctx.state.user : null,
    ])

    let [posts, postsCount, currentUser] = results

    ctx.body = {
      posts: posts.map((post) => post.toJSONFor(currentUser)),
      postsCount: postsCount,
    }
  } catch (err) {
    console.log(err)
    ctx.throw(err)
  }
}

const create = async(ctx) => {
  try {
    const { body } = ctx.request
    const { user } = ctx.state

    const post = new Post(body.post)

    post.author = user

    await post.save()

    ctx.body = { post: post.toJSONFor(user) }
  } catch (err) {
    console.log(err)
    ctx.throw(err)
  }
}

const getFeed = async(ctx) => {
  try {
    const { user } = ctx.state
    const { offset, limit } = ctx.query

    let results = await Promise.all([
      Post.find({ author: { $in: user.following } })
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author'),
      Post.count({ author: { $in: user.following } }),
    ])

    const [articles, articlesCount] = results

    ctx.body = {
      articles: articles.map((article) => article.toJSONFor(user)),
      articlesCount,
    }
  } catch (err) {
    console.log(err)
    ctx.throw(err)
  }
}

const show = async(ctx) => {
  try {
    ctx.body = {
      post: ctx.state.post.toJSONFor(ctx.state.user),
    }
  } catch (err) {
    console.log(err)
    ctx.throw(err)
  }
}

const update = async(ctx) => {
  try {
    const { post, user } = ctx.state
    const { body } = ctx.request

    if (post.author._id.toString() === user._id.toString()) {
      const updated = merge(post, body.post)
      await updated.save()
      ctx.body = {
        post: post.toJSONFor(user),
      }
    } else {
      ctx.throw(403)
    }
  } catch (err) {
    console.error(err)
    ctx.throw(500)
  }
}

const del = async(ctx) => {
  try {
    const { post, user } = ctx.state
    if (post.author._id.toString() === user._id.toString()) {
      await post.remove()
      ctx.status = 204
    } else {
      ctx.throw(403)
    }
  } catch (err) {
    console.error(err)
    ctx.throw(500)
  }
}

module.exports = {
  index,
  create,
  feed: {
    get: getFeed,
  },
  byId,
  show,
  update,
  del,
}
