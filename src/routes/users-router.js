const Router = require('koa-router')
const ctrl = require('controllers').users
const router = new Router()

const auth = require('middleware/auth-required-middleware')

/*
 * @api [post] /users/login
 * tags: [user]
 * summary: "Login"
 * description: "Login to app and return generated JWT. Accepts email/password."
 * parameters: [{name: body, in: body, description: "User to create", required: true, schema: { $ref: "#/definitions/LoginUser" }}]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/AuthedUser"
 */
router.post('/users/login', ctrl.login)

/*
 * @api [post] /users
 * tags: [user]
 * summary: "Create new user"
 * description: "Creates a new user and returns JWT."
 * parameters: [{name: body, in: body, description: "User to create", required: true, schema: { $ref: "#/definitions/User" }}]
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/AuthedUser"
 */
router.post('/users', ctrl.post)

/*
 * @api [get] /user
 * tags: [user]
 * summary: "Get current user"
 * description: "Must provide valid Authorization Token and returns JWT."
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/AuthedUser"
 */
router.get('/user', auth, ctrl.get)

/*
 * @api [put] /user
 * tags: [user]
 * summary: "Update current user"
 * description: "Must provide valid Authorization Token and returns JWT."
 * responses:
 *   200:
 *     description: "successful operation"
 *     schema:
 *       $ref: "#/definitions/AuthedUser"
 */
router.put('/user', auth, ctrl.put)

module.exports = router.routes()
