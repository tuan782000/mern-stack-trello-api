import express from 'express'
import { CardController } from '*/controllers/card.controller'
import { CardValidation } from '*/validations/card.validation'
import { AuthMiddleWare } from '*/middlewares/auth.middleware'
import { UploadMiddleware } from '*/middlewares/upload.middleware'


const router = express.Router()

router.route('/')
  .post(AuthMiddleWare.isAuthorized, CardValidation.createNew, CardController.createNew)

router.route('/:id')
  .put(AuthMiddleWare.isAuthorized, UploadMiddleware.upload.single('cover'), CardValidation.update, CardController.update)

export const cardRoutes = router
