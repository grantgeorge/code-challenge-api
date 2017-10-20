const Router = require('koa-router')
const ctrl = require('controllers').profiles
const router = new Router()

const auth = require('middleware/auth-required-middleware')

router.param('username', ctrl.byUsername)

/*
 * @api [get] /profiles/{username}
 * tags: [profile]
 * summary: "Get a users profile"
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: username, in: path, description: "Username of the user to return", required: true, type: "string"}]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/Profile"
 */
router.get('/profiles/:username', ctrl.show)

/*
 * @api [post] /profiles/{username}/follow
 * tags: [follow]
 * summary: "Follow a user"
 * description: "Returns a simple object for the associated user."
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: username, in: path, description: "Username of the user to follow", required: true, type: "string"}]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/Profile"
 */
router.post('/profiles/:username/follow', auth, ctrl.followCreate)

/*
 * @api [delete] /profiles/{username}/follow
 * tags: [follow]
 * summary: "Unfollow a user"
 * description: "Returns a simple object for the associated user."
 * consumes: [application/json]
 * produces: [application/json]
 * parameters: [{name: username, in: path, description: "Username of the user to unfollow", required: true, type: "string"}]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/Profile"
 */
router.del('/profiles/:username/follow', auth, ctrl.followDel)

module.exports = router.routes()
