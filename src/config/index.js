const path = require('path')
const _ = require('lodash')
const strength = require('strength')

const ROOT = path.resolve(__dirname, '../')
const NODE_ENV = _.defaultTo(process.env.NODE_ENV, 'development')

const isProd = NODE_ENV === 'production'
const isTest = NODE_ENV === 'test'
const isDev = NODE_ENV === 'development'

module.exports = {
  server: {
    port: normalizePort(_.defaultTo(process.env.PORT, 1337)),
    host: _.defaultTo(process.env.HOST, 'localhost'),
    root: ROOT,
    data: path.join(ROOT, '../', '/data'),
  },

  env: {
    isDev,
    isProd,
    isTest,
  },

  cors: {
    origin: '*',
    exposeHeaders: ['Authorization'],
    credentials: true,
    allowMethods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowHeaders: ['Authorization', 'Content-Type'],
    keepHeadersOnError: true,
  },

  bodyParser: {
    enableTypes: ['json', 'html'],
  },

  secret: _.defaultTo(process.env.SECRET, 'secret'),

  jwtSecret: _.defaultTo(process.env.JWT_SECRET, 'secret'),

  jwtOptions: {
    expiresIn: '7d',
  },

  // mongoose
  mongoose: {
    debug: process.env.MONGOOSE_DEBUG,
    Promise: global.Promise,
    mongo: {
      url: process.env.DATABASE_URL,
    },
  },

  // authentication
  auth: {
    local: process.env.AUTH_LOCAL_ENABLED,
    providers: {
      facebook: process.env.AUTH_FACEBOOK_ENABLED,
    },
    strategies: {
      local: {
        usernameField: 'email',
        passwordField: 'password',
        session: false,
        usernameLowerCase: true,
        limitAttempts: true,
        maxAttempts:
          process.env.NODE_ENV === 'development' ? Number.MAX_VALUE : 5,
        digestAlgorithm: 'sha256',
        encoding: 'hex',
        saltlen: 32,
        iterations: 25000,
        keylen: 512,
        passwordValidator: (password, cb) => {
          if (process.env.NODE_ENV === 'development') return cb()
          const howStrong = strength(password)
          cb(howStrong < 3 ? new Error('Password not strong enough') : null)
        },
      },
    },
  },
}

function normalizePort(val) {
  var port = parseInt(val, 10)

  if (isNaN(port)) {
    return val
  }

  if (port >= 0) {
    return port
  }

  return false
}
