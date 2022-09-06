import express from 'express'
import { UserController } from '*/controllers/user.controller'
import { UserValidation } from '*/validations/user.validation'
import { AuthMiddleWare } from '*/middlewares/auth.middleware'
import { UploadMiddleware } from '*/middlewares/upload.middleware'

const router = express.Router()

router.route('/sign_up')
  .post(UserValidation.createNew, UserController.createNew)

router.route('/verify')
  .put(UserValidation.verifyAccount, UserController.verifyAccount)

router.route('/sign_in')
  .post(UserValidation.signIn, UserController.signIn)

router.route('/sign_out')
  .delete(UserController.signOut)

router.route('/refresh_token')
  .get(UserController.refreshToken)

router.route('/update')
  .put(AuthMiddleWare.isAuthorized, UploadMiddleware.upload.single('avatar'), UserValidation.update, UserController.update)

export const userRoutes = router