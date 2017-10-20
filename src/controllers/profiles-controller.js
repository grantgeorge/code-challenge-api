const mongoose = require('mongoose')
const User = mongoose.model('User')

const byUsername = async(username, ctx, next) => {
  if (!username) {
    ctx.throw(404)
  }

  ctx.state.profile = await User.findOne({ username })

  if (!ctx.state.profile) {
    ctx.throw(404)
  }

  await next()
}

const show = async(ctx) => {
  const { profile, user } = ctx.state

  ctx.body = { profile: profile.toProfileJSONFor(user) }
}

const followCreate = async(ctx) => {
  try {
    const { profile, user } = ctx.state
    await user.follow(profile._id)
    ctx.body = {
      profile: profile.toProfileJSONFor(user),
    }
  } catch (err) {
    console.error(err)
    ctx.status = 500
  }
}

const followDel = async(ctx) => {
  try {
    const { profile, user } = ctx.state
    await user.unfollow(profile._id)
    ctx.body = {
      profile: profile.toProfileJSONFor(user),
    }
  } catch (err) {
    console.error(err)
    ctx.status = 500
  }
}

module.exports = {
  byUsername,
  show,
  followCreate,
  followDel,
}
