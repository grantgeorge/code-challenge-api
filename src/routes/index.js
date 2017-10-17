const Router = require('koa-router')
const router = new Router()
const api = new Router()

const users = require('./users-router')
const posts = require('./posts-router')
const profiles = require('./profiles-router')

api.use(users)
api.use(posts)
api.use(profiles)

router.use('/api', api.routes())

module.exports = router
