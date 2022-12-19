import express from 'express'
import { InvitationController } from '*/controllers/invitation.controller'
import { InvitationValidation } from '*/validations/invitation.validation'
import { AuthMiddleware } from '*/middlewares/auth.middleware'

const router = express.Router()

//create board invitation
router.route('/board')
  .post(AuthMiddleware.isAuthorized, InvitationValidation.createNewBoardInvitation, InvitationController.createNewBoardInvitation)

//get invitations by user
router.route('/')
  .get(AuthMiddleware.isAuthorized, InvitationController.getInvitations)

router.route('/board/:invitationId')
  .put(AuthMiddleware.isAuthorized, InvitationController.updateBoardInvitation)

export const invitationRoutes = router
