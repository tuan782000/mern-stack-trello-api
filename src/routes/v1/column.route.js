import express from 'express'
import { ColumnController } from '*/controllers/column.controller'
import { ColumnValidation } from '*/validations/column.validation'
import { AuthMiddleWare } from '*/middlewares/auth.middleware'

const router = express.Router()

router.route('/')
  .post(AuthMiddleWare.isAuthorized, ColumnValidation.createNew, ColumnController.createNew)

router.route('/:id')
  .put(AuthMiddleWare.isAuthorized, ColumnValidation.update, ColumnController.update)

export const columnRoutes = router
