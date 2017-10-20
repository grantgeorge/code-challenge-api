const errors = require('lib/errors')
let constants = require('lib/constants')
const _ = require('lodash')

const http = require('http')

Object.entries(http.STATUS_CODES).forEach(([key, value]) => {
  constants.HTTP[key] = value.toUpperCase().replace(/\s/gim, '_')
})

module.exports = async(ctx, next) => {
  try {
    await next()
    if (Number(ctx.response.status) === 404 && !ctx.response.body) {
      // we need to explicitly set 404 here
      // so that koa doesn't assign 200 on body=
      ctx.status = 404
      ctx.type = 'json'
      ctx.body = {
        message: 'Not Found',
        documentationUrl:
          'https://app.swaggerhub.com/apis/Set-The-Set/sts-code-challenge-api/1.0.0',
      }
    }
  } catch (err) {
    ctx.type = 'application/json'

    if (!ctx.response.body) {
      ctx.response.body = { errors: {} }
    }
    // ctx.app.emit('error', err, ctx);

    switch (true) {
      case err instanceof errors.ValidationError:
        ctx.body.errors = formatValidationError(err)
        ctx.status = _.defaultTo(err.status, 422)
        break
      default:
        ctx.status = _.defaultTo(err.status, 500)
        break
    }
  } finally {
    if (ctx.body && !ctx.body.code) {
      ctx.body.code = constants.HTTP[String(ctx.status)]
    }
  }
}

function formatValidationError(err) {
  const result = {}
  if (err.path) {
    result[err.path] = [_.defaultTo(err.message, 'is not valid')]
  }
  if (err.inner && err.inner.length > 0) {
    err.inner
      .map((err) => formatValidationError(err))
      .reduce((prev, curr) => Object.assign(prev, curr), result)
  }
  return result
}
