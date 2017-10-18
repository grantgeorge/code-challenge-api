const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const CommentSchema = new mongoose.Schema(
  {
    body: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  },
  { timestamps: true }
)

// Requires population of author
CommentSchema.methods.toJSONFor = function(user) {
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    author: this.author.toProfileJSONFor(user),
  }
}

module.exports = mongoose.model('Comment', CommentSchema)
