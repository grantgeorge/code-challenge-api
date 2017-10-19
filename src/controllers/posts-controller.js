const mongoose = require('mongoose')
const Post = mongoose.model('Post')
const User = mongoose.model('User')
const Comment = mongoose.model('Comment')
// const comments = require('./comments-controller')
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

const byComment = async(comment, ctx, next) => {
  if (!comment) {
    ctx.throw(404)
  }

  const thisComment = await Comment.findById(comment)

  if (!thisComment) {
    ctx.throw(404)
  }

  ctx.state.comment = thisComment

  await next()
}

const index = async(ctx) => {
  try {
    const { offset, limit, author, favorited } = ctx.query
    const query = {}

    let queries = await Promise.all([
      author ? User.findOne({ username: author }) : null,
      favorited ? User.findOne({ username: favorited }) : null,
    ])

    let thisAuthor = queries[0]
    let favoriter = queries[1]

    console.log('author: ', thisAuthor)
    console.log('favoriter: ', favoriter)

    if (thisAuthor) {
      query.author = author._id
    }

    if (favoriter) {
      query._id = { $in: favoriter.favorites }
    } else if (favorited) {
      query._id = { $in: [] }
    }

    console.log(query)

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

    console.log('posts: ', posts)

    console.log('ctx.state.user: ', ctx.state.user)

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
      Post.find({ author: { $in: user.following.concat(user._id) } })
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author'),
      Post.count({ author: { $in: user.following } }),
    ])

    const [posts, postsCount] = results

    ctx.body = {
      posts: posts.map((post) => post.toJSONFor(user)),
      postsCount,
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

const favoriteCreate = async(ctx) => {
  try {
    const { post, user } = ctx.state
    const postId = post._id

    await user.favorite(postId)

    let updated = await post.updateFavoriteCount()

    ctx.body = {
      post: updated.toJSONFor(user),
    }
  } catch (err) {
    console.error(err)
    ctx.throw(500)
  }
}

const favoriteDel = async(ctx) => {
  try {
    const { post, user } = ctx.state
    const postId = post._id

    await user.unfavorite(postId)

    let updated = await post.updateFavoriteCount()

    ctx.body = {
      post: updated.toJSONFor(user),
    }
  } catch (err) {
    console.error(err)
    ctx.throw(500)
  }
}

const commentsGet = async(ctx) => {
  try {
    const { post, user } = ctx.state
    await post
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
        },
        options: {
          sort: {
            createdAt: 'desc',
          },
        },
      })
      .execPopulate()
    ctx.body = {
      comments: post.comments.map((comment) => comment.toJSONFor(user)),
    }
  } catch (err) {
    console.error(err)
    ctx.throw(500)
  }
}

const commentsCreate = async(ctx) => {
  try {
    const { post, user } = ctx.state
    const { body } = ctx.request

    const comment = await Comment.create(
      merge({ author: user, post }, body.comment)
    )

    post.comments.push(comment)

    await post.save()

    ctx.body = {
      comment: comment.toJSONFor(user),
    }
  } catch (err) {
    console.error(err)
    ctx.throw(500)
  }
}

const commentsDel = async(ctx) => {
  try {
    const { post, comment, user } = ctx.state
    if (comment.author.toString() === user.id.toString()) {
      post.comments.remove(comment._id)
      await post.save()
      await comment.remove()
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
  byId,
  byComment,

  index,
  create,
  feed: {
    get: getFeed,
  },
  show,
  update,
  del,
  favorite: {
    create: favoriteCreate,
    del: favoriteDel,
  },
  comments: {
    get: commentsGet,
    create: commentsCreate,
    del: commentsDel,
  },
}
