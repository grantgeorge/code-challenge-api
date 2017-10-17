const { has } = require('lodash')
const mongoose = require('mongoose')
const User = mongoose.model('User')

module.exports = async(ctx, next) => {
  if (has(ctx, 'state.jwt.id')) {
    ctx.state.user = await User.findById(ctx.state.jwt.id)
  }

  return next()
}
