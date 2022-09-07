import express from 'express'
import { BoardController } from '*/controllers/board.controller'
import { BoardValidation } from '*/validations/board.validation'
import { AuthMiddleWare } from '*/middlewares/auth.middleware'

const router = express.Router()

router.route('/')
  .get(AuthMiddleWare.isAuthorized, BoardController.getListBoards)
  .post(AuthMiddleWare.isAuthorized, BoardValidation.createNew, BoardController.createNew)

router.route('/:id')
  .get(AuthMiddleWare.isAuthorized, BoardController.getFullBoard)
  .put(AuthMiddleWare.isAuthorized, BoardValidation.update, BoardController.update)

export const boardRoutes = router
