const passport = require('koa-passport')
const LocalStrategy = require('passport-local').Strategy
// const mongoose = require('mongoose')
const User = require('models/User')

passport.use(
  new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]',
    },
    async(email, password, done) => {
      try {
        let user = await User.findOne({ email: email })

        if (!user || !user.validPassword(password)) {
          return done(null, false, {
            errors: { 'email or password': 'is invalid' },
          })
        }

        return done(null, user)
      } catch (err) {
        done(err)
      }
    }
  )
)

module.exports = passport
