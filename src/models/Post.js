const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const User = mongoose.model('User')

const PostSchema = new mongoose.Schema(
  {
    body: String,
    favoritesCount: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

PostSchema.methods.updateFavoriteCount = function() {
  const post = this

  return User.count({ favorites: { $in: [post._id] } }).then((count) => {
    post.favoritesCount = count

    return post.save()
  })
}

PostSchema.methods.toJSONFor = function(user) {
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user),
  }
}

module.exports = mongoose.model('Post', PostSchema)
