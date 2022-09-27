import express from 'express'
import { InvitationController } from '*/controllers/invitation.controller'
import { InvitationValidation } from '*/validations/invitation.validation'
import { AuthMiddleWare } from '*/middlewares/auth.middleware'

const router = express.Router()

//create board invitation
router.route('/board')
  .post(AuthMiddleWare.isAuthorized, InvitationValidation.createNewBoardInvitation, InvitationController.createNewBoardInvitation)

//get invitations by user
router.route('/')
  .get(AuthMiddleWare.isAuthorized, InvitationController.getInvitations)

export const invitationRoutes = router
