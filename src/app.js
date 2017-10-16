const render = require('./lib/render')
const logger = require('koa-logger')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const koa404Handler = require('koa-404-handler')
const json = require('koa-json')
const compress = require('koa-compress')
const responseTime = require('koa-response-time')
const removeTrailingSlashes = require('koa-no-trailing-slash')
const helmet = require('koa-helmet')
const Timeout = require('koa-better-timeout')

const Koa = require('koa')
const app = (module.exports = new Koa())

let port = process.env.NODE_ENV === 'development' ? 1337 : 9000

// "database"

const posts = []

// middleware

app.use(logger())

app.use(render)

// security
app.use(helmet())

// remove trailing slashes
app.use(removeTrailingSlashes())

// body parser
app.use(bodyParser())

// pretty-printed json responses
app.use(json())

// compress/gzip
app.use(compress())

// response time
app.use(responseTime())

// configure timeout
app.use(async (ctx, next) => {
  try {
    const timeout = new Timeout({
      ms: 3000,
      message: 'REQUEST_TIMED_OUT',
    })
    await timeout.middleware(ctx, next)
  } catch (err) {
    ctx.throw(err)
  }
})

// 404 handler
app.use(koa404Handler)

// route definitions

router
  .get('/', list)
  .get('/post/new', add)
  .get('/post/:id', show)
  .get('/post/:id/json', showJson)
  .get('/json', listJson)
  .post('/post', create)

app.use(router.routes())

/**
 * Post listing.
 */

async function list(ctx) {
  await ctx.render('list', { posts: posts })
}

async function listJson(ctx) {
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
  await ctx.render('show', { post: post })
}

async function showJson(ctx) {
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

// listen

console.log('is module parent')

// if (!module.parent)
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
