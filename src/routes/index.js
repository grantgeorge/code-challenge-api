const Router = require('koa-router')
const router = new Router()
const api = new Router()

const users = require('./users-router')
const posts = require('./posts-router')
const profiles = require('./profiles-router')

api.use(users)
api.use(posts)
api.use(profiles)

/*
 * @api [get] /status
 * tags: [status]
 * summary: "Check API Status"
 * description: "Litmus test for API availability. Returns a 200 OK with a small JSON status payload."
 * responses:
 *   200:
 *     description: "successful operation"
 */
router.get('/api/status', async(ctx) => {
  ctx.body = {
    status: 'OK',
  }
})

router.use('/api', api.routes())

module.exports = router
