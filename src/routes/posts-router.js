const Router = require('koa-router')
const ctrl = require('controllers').posts
const router = new Router()

const auth = require('middleware/auth-required-middleware')

router.param('id', ctrl.byId)
router.param('comment', ctrl.byComment)

/*
 * @api [get] /posts
 * tags: [post]
 * summary: "Get a collection of Posts."
 * description: "Can provide offset, limit, etc."
 * responses:
 *   200:
 *     description: "successful operation"
 */
router.get('/posts', ctrl.index)
router.post('/posts', auth, ctrl.create)

router.get('/posts/feed', auth, ctrl.feed.get)

router.get('/posts/:id', ctrl.show)
router.put('/posts/:id', auth, ctrl.update)
router.del('/posts/:id', auth, ctrl.del)

router.post('/posts/:id/favorite', auth, ctrl.favorite.create)
router.del('/posts/:id/favorite', auth, ctrl.favorite.del)

router.get('/posts/:id/comments', ctrl.comments.get)
router.post('/posts/:id/comments', auth, ctrl.comments.create)
router.del('/posts/:id/comments/:comment', auth, ctrl.comments.del)

module.exports = router.routes()
