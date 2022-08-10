import express from 'express'
import { UserController } from '*/controllers/user.controller'
import { UserValidation } from '*/validations/user.validation'

const router = express.Router()

router.route('/sign_up')
  .post(UserValidation.createNew, UserController.createNew)

export const userRoutes = router