const Router = require('koa-router')
const ctrl = require('controllers').posts
const router = new Router()

const auth = require('middleware/auth-required-middleware')

router.param('id', ctrl.byId)
router.param('comment', ctrl.byComment)

/*
 * @api [get] /posts
 * tags: [post]
 * summary: "Get a collection of all posts"
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: limit, in: query, description: "limit amount of response", required: false, type: "string" }, {name: offset, in: query, description: "Offset of returned results", required: false, type: "string" }, {name: author, in: query, description: "Limit to posts by author name", required: false, type: "string" }]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       type: array
 *       items:
 *         $ref: "#/definitions/Post"
 */
router.get('/posts', ctrl.index)

/*
 * @api [post] /posts
 * tags: [post]
 * summary: "Create a new post"
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: body, in: body, description: "Post data to update with", required: true, schema: { type: "object", "properties": { "body": { "type": "string" } } } }]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/Post"
 */
router.post('/posts', auth, ctrl.create)

/*
 * @api [get] /posts/feed
 * tags: [post]
 * summary: "Get a the post feed (your posts and posts of followers)"
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: limit, in: query, description: "limit amount of response", required: false, type: "string" }, {name: offset, in: query, description: "Offset of returned results", required: false, type: "string" }]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       type: array
 *       items:
 *         $ref: "#/definitions/Post"
 */
router.get('/posts/feed', auth, ctrl.feed.get)

/*
 * @api [get] /posts/{postId}
 * tags: [post]
 * summary: "Find post by ID"
 * description: Returns a single post
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: postId, in: path, description: "ID of the post to return", required: true, type: "string"}]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/Post"
 */
router.get('/posts/:id', ctrl.show)

/*
 * @api [put] /posts/{postId}
 * tags: [post]
 * summary: "Updates a post"
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: postId, in: path, description: "ID of the post to modify", required: true, type: "string"}, {name: body, in: body, description: "Post data to update with", required: true, schema: { type: "object", "properties": { "body": { "type": "string" } } } }]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/Post"
 */
router.put('/posts/:id', auth, ctrl.update)

/*
 * @api [delete] /posts/{postId}
 * tags: [post]
 * summary: "Delete a post"
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: postId, in: path, description: "ID of the post to delete", required: true, type: "string"}]
 * responses:
 *   204:
 *     description: "successful operation"
 */
router.del('/posts/:id', auth, ctrl.del)

/*
 * @api [post] /posts/{postId}/favorite
 * tags: [favorite]
 * summary: "Favorite a post"
 * description: "Returns the updated post"
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: postId, in: path, description: "ID of the post to favorite", required: true, type: "string"}]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/Post"
 */
router.post('/posts/:id/favorite', auth, ctrl.favorite.create)

/*
 * @api [delete] /posts/{postId}/favorite
 * tags: [favorite]
 * summary: "Unfavorite a post"
 * description: "Returns the updated post"
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: postId, in: path, description: "ID of the post to unfavorite", required: true, type: "string"}]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/Post"
 */
router.del('/posts/:id/favorite', auth, ctrl.favorite.del)

/*
 * @api [get] /posts/{postId}/comments
 * tags: [comment]
 * summary: "Get comments for post"
 * description: "Returns array of comments"
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: postId, in: path, description: "ID of the post to fetch comments for", required: true, type: "string"}]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       type: array
 *       items:
 *         $ref: "#/definitions/Comment"
 */
router.get('/posts/:id/comments', ctrl.comments.get)

/*
 * @api [post] /posts/{postId}/comments
 * tags: [comment]
 * summary: "Create a new comment for post"
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: postId, in: path, description: "ID of the post to create a comment for", required: true, type: "string"}]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/Comment"
 */
router.post('/posts/:id/comments', auth, ctrl.comments.create)

/*
 * @api [delete] /posts/{postId}/comments/{commentId}
 * tags: [comment]
 * summary: "Delete a comment"
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: postId, in: path, description: "ID of the post that contains comment to delete", required: true, type: "string"}, {name: commentId, in: path, description: "ID of the comment to delete", required: true, type: "string"}]
 * responses:
 *   204:
 *     description: "successful operation"
 */
router.del('/posts/:id/comments/:comment', auth, ctrl.comments.del)

module.exports = router.routes()
