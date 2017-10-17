const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
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

PostSchema.plugin(uniqueValidator, { message: 'is already taken' })

PostSchema.methods.updateFavoriteCount = function() {
  const post = this

  return User.count({ favorites: { $in: [post._id] } }).then((count) => {
    post.favoritesCount = count

    return post.save()
  })
}

PostSchema.methods.toJSONFor = function(user) {
  return {
    slug: this.slug,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user),
  }
}

mongoose.model('Post', PostSchema)
