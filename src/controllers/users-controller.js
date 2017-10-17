const mongoose = require('mongoose')
const humps = require('humps')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const { ValidationError } = require('lib/errors')
const { generateJWTforUser } = require('lib/utils')
const User = mongoose.model('User')
const passport = require('passport')

const get = async(ctx) => {
  const user = ctx.state.user

  ctx.body = { user: user.toAuthJSON() }
}

const post = async(ctx) => {
  const { body } = ctx.request

  console.log(body)

  const user = new User()

  console.log('new user: ', user)

  user.username = body.user.username
  user.email = body.user.email
  user.setPassword(body.user.password)

  await user.save()

  ctx.body = { user: user.toAuthJSON() }
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

// TODO: fuck
const login = async(ctx) => {
  const { body } = ctx.request

  if (!_.isObject(body.user) || !body.user.email || !body.user.password) {
    ctx.throw(422, new ValidationError(['is invalid'], '', 'email or password'))
  }

  await passport.authenticate(
    'local',
    { session: false },
    (err, user, info) => {
      return new Promise(async(resolve, reject) => {
        if (err) {
          reject(err)
        }

        if (user) {
          user.token = user.generateJWT()
          ctx.body = user.toAuthJSON()
        } else {
          ctx.throw(
            422,
            new ValidationError(['is invalid'], '', 'email or password')
          )
        }
        return resolve()
      })
    }
  )
}

module.exports = {
  get,
  post,
  put,
  login,
}
