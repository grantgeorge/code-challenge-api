const mongoose = require('mongoose')
const { ValidationError } = require('lib/errors')
const User = mongoose.model('User')
const passport = require('config/passport')

const get = async(ctx) => {
  const user = ctx.state.user

  ctx.body = { user: user.toAuthJSON() }
}

const post = async(ctx) => {
  try {
    const { body } = ctx.request

    const user = new User()

    user.username = body.user.username
    user.email = body.user.email
    user.setPassword(body.user.password)

    await user.save()

    ctx.body = { user: user.toAuthJSON() }
  } catch (err) {
    console.log(err)
    ctx.status = 500
  }
}

const put = async(ctx) => {
  const { body } = ctx.request
  const user = ctx.state.user

  try {
    // only update fields that were actually passed...
    if (typeof body.user.username !== 'undefined') {
      user.username = body.user.username
    }
    if (typeof body.user.email !== 'undefined') {
      user.email = body.user.email
    }
    if (typeof body.user.bio !== 'undefined') {
      user.bio = body.user.bio
    }
    if (typeof body.user.image !== 'undefined') {
      user.image = body.user.image
    }
    if (typeof body.user.password !== 'undefined') {
      user.setPassword(body.user.password)
    }

    await user.save()

    ctx.body = { user: user.toAuthJSON() }
  } catch (err) {
    console.log(err)
    ctx.status = 500
  }
}

const login = async(ctx) => {
  try {
    await passport.authenticate('local', { session: false }, async function(
      err,
      user,
      info,
      status
    ) {
      if (err) {
        ctx.throw(err)
      }

      if (user) {
        user.token = await user.generateJWT()
        ctx.body = {
          user: user.toAuthJSON(),
        }
      } else {
        ctx.body = {
          error: new ValidationError(['is invalid'], '', 'email or password'),
        }
        ctx.status = 422
      }
    })(ctx)
  } catch (err) {
    console.error(err)
    ctx.status = 500
  }
}

module.exports = {
  get,
  post,
  put,
  login,
}
