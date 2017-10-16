// route definitions
const Router = require('koa-router')
// const ctrl = require('controllers').articles
const router = new Router()

const auth = require('middleware/auth-required-middleware')

// "database"

const posts = []

router
  .get('/', list)
  .get('/post/new', add)
  .get('/post/:id', show)
  .post('/post', create)

/**
 * Post listing.
 */

async function list(ctx) {
  ctx.body = {
    posts,
  }
}

/**
 * Show creation form.
 */

async function add(ctx) {
  await ctx.render('new')
}

/**
 * Show post :id.
 */

async function show(ctx) {
  const id = ctx.params.id
  const post = posts[id]
  if (!post) ctx.throw(404, 'invalid post id')
  return (ctx.body = post)
}

/**
 * Create a post.
 */

async function create(ctx) {
  const post = ctx.request.body
  const id = posts.push(post) - 1
  post.created_at = new Date()
  post.id = id
  ctx.redirect('/')
}

module.exports = router.routes()
