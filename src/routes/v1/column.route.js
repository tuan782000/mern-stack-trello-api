import express from 'express'
import { ColumnController } from '*/controllers/column.controller'
import { ColumnValidation } from '*/validations/column.validation'
import { AuthMiddleware } from '*/middlewares/auth.middleware'

const router = express.Router()

router.route('/')
  .post(AuthMiddleware.isAuthorized, ColumnValidation.createNew, ColumnController.createNew)

router.route('/:id')
  .put(AuthMiddleware.isAuthorized, ColumnValidation.update, ColumnController.update)

export const columnRoutes = router
