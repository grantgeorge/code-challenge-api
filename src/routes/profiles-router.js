const Router = require('koa-router')
const ctrl = require('controllers').profiles
const router = new Router()

const auth = require('middleware/auth-required-middleware')

router.param('username', ctrl.byUsername)

router.get('/profiles/:username', ctrl.show)
router.post('/profiles/:username/follow', auth, ctrl.followCreate)
router.del('/profiles/:username/follow', auth, ctrl.followDel)

module.exports = router.routes()
