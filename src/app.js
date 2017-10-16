const config = require('config')
const http = require('http')
const render = require('./lib/render')
const logger = require('koa-logger')
const camelizeMiddleware = require('middleware/camelize-middleware')
const bodyParser = require('koa-bodyparser')
const koa404Handler = require('koa-404-handler')
const json = require('koa-json')
const errorHandler = require('koa-better-error-handler')
const compress = require('koa-compress')
const responseTime = require('koa-response-time')
const removeTrailingSlashes = require('koa-no-trailing-slash')
const conditional = require('koa-conditional-get')
const cors = require('kcors')
const jwt = require('middleware/jwt-middleware')
const etag = require('koa-etag')
const helmet = require('koa-helmet')
const Timeout = require('koa-better-timeout')
const routes = require('routes')

const Koa = require('koa')
const app = new Koa()

app.keys = [config.secret]

// middleware

if (!config.env.isTest) {
  app.use(responseTime())
  app.use(helmet())
}

app.use(logger())

// Camelize keys
app.use(camelizeMiddleware)

// conditional-get
app.use(conditional())

// etag
app.use(etag())

// cors
app.use(cors(config.cors))

// JWT Middleware
app.use(jwt)

app.use(render)

// remove trailing slashes
app.use(removeTrailingSlashes())

// body parser
app.use(bodyParser(config.bodyParser))

// pretty-printed json responses
app.use(json())

// compress/gzip
app.use(compress())

// override koa's undocumented error handler
app.context.onerror = errorHandler

// configure timeout
app.use(async(ctx, next) => {
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

app.use(routes.routes())
app.use(routes.allowedMethods())

app.server = require('http-shutdown')(http.createServer(app.callback()))

// 404 handler
app.use(koa404Handler)

app.shutDown = function shutDown() {
  let err

  console.log('Shutdown')

  if (this.server.listening) {
    this.server.shutdown((error) => {
      if (error) {
        console.error(error)
        err = error
      }

      this.db
        .destroy()
        .catch((error) => {
          console.error(error)
          err = error
        })
        .then(() => process.exit(err ? 1 : 0))
    })
  }
}

module.exports = app
