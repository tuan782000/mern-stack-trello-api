import express from 'express'
import { UserController } from '*/controllers/user.controller'
import { UserValidation } from '*/validations/user.validation'

const router = express.Router()

router.route('/sign_up')
  .post(UserValidation.createNew, UserController.createNew)

router.route('/verify')
  .put(UserValidation.verifyAccount, UserController.verifyAccount)

router.route('/sign_in')
  .post(UserValidation.signIn, UserController.signIn)

export const userRoutes = router