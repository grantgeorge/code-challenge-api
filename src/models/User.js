const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const secret = require('../config').secret

const UserSchema = new mongoose.Schema(
  {
    hash: String,
    salt: String,
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, 'is invalid'],
      index: true,
    },
    bio: String,
    image: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

UserSchema.methods.validPassword = function(password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex')
  return this.hash === hash
}

UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
    .toString('hex')
}

UserSchema.methods.generateJWT = function() {
  const today = new Date()
  const exp = new Date(today)
  exp.setDate(today.getDate() + 60)

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      exp: '1d',
    },
    secret
  )
}

UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    image: this.image,
  }
}

UserSchema.methods.toProfileJSONFor = function(user) {
  return {
    email: this.email,
    username: this.username,
    bio: this.bio,
    image:
      this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
    following: user ? user.isFollowing(this._id) : false,
  }
}

UserSchema.methods.favorite = function(id) {
  if (this.favorites.indexOf(id) === -1) {
    this.favorites.push(id)
  }

  return this.save()
}

UserSchema.methods.unfavorite = function(id) {
  this.favorites.remove(id)
  return this.save()
}

UserSchema.methods.isFavorite = function(id) {
  return this.favorites.some(function(favoriteId) {
    return favoriteId.toString() === id.toString()
  })
}

UserSchema.methods.follow = function(id) {
  if (this.following.indexOf(id) === -1) {
    this.following.push(id)
  }

  return this.save()
}

UserSchema.methods.unfollow = function(id) {
  this.following.remove(id)
  return this.save()
}

UserSchema.methods.isFollowing = function(id) {
  return this.following.some((followId) => {
    return followId.toString() === id.toString()
  })
}

// https://github.com/saintedlama/passport-local-mongoose/issues/218
UserSchema.statics.registerAsync = function(data, password) {
  return new Promise((resolve, reject) => {
    this.register(data, password, (err, user) => {
      if (err) return reject(err)
      resolve(user)
    })
  })
}

// UserSchema.statics.findByEmail = UserSchema.statics.findByUsername

module.exports = mongoose.model('User', UserSchema)
