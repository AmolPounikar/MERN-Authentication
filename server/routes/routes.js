import { Router } from "express";
import * as controller from "../controller/appController.js";
import { registerMail } from "../controller/mailler.js";
import Auth, { localVariables } from "../middleware/auth.js";
const router = Router()

/** POST Methods */
router.route('/register').post(controller.register)
router.route('/registerMail').post(registerMail)
router.route('/authenticate').post(controller.verifyUser, (req, res) => res.end())
router.route('/login').post(controller.verifyUser, controller.login)

/**  GET Methods */
router.route('/user/:username').get(controller.getUser)
router.route('/generateOTP').get(controller.verifyUser, localVariables, controller.generateOTP)
router.route('/verifyOTP').get(controller.verifyUser, controller.verifyOTP)
router.route('/createResetSession').get(controller.createResetSession)

/** PUT Methods */
router.route('/updateuser').put(Auth, controller.updateUser)
router.route('/resetPassword').put(controller.verifyUser, controller.resetPassword)

export default router