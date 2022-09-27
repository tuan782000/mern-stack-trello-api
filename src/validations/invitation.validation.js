import Joi from 'joi'
import { HttpStatusCode } from '*/utilities/constants'

const createNewBoardInvitation = async (req, res, next) => {
  const condition = Joi.object({
    inviteeEmail: Joi.string().required(),
    boardId: Joi.string().required()
  })
  try {
    await condition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      errors: new Error(error).message
    })
  }
}

export const InvitationValidation = {
  createNewBoardInvitation
}