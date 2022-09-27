import { InvitationModel } from '*/models/invitation.model'
import { UserModel } from '*/models/user.model'
import { BoardModel } from '*/models/board.model'
import { pickUser } from '*/utilities/transform'

const createNewBoardInvitation = async (data, userId) => {
  try {
    // Bài tập 01 - (dễ): Kiểm tra xem thằng user nó có đang test mời tới chính nó hay không
    // Bài tập 02 - (trung bình): Kiểm tra xem người được mời (invitee) đã được mời vào đúng cái board hiện tại hay chưa, tránh trường hợp spam invite

    const inviter = await UserModel.findOneByAny('_id', userId)
    const invitee = await UserModel.findOneByAny('email', data.inviteeEmail)
    const board = await BoardModel.findOneById(data.boardId)
    if (!invitee || !inviter || !board) {
      throw new Error('Inviter, invitee or board not found!')
    }

    const invitation = {
      inviterId: userId,
      inviteeId: invitee._id.toString(),
      type: InvitationModel.INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: data.boardId,
        status: InvitationModel.BOARD_INVITATION_STATUS.PENDING
      }
    }

    const createdInvitation = await InvitationModel.createNewBoardInvitation(invitation)
    const getInvitation = await InvitationModel.findOneById(createdInvitation.insertedId.toString())

    const resData = {
      ...getInvitation,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee),
      board: board
    }
    return resData

  } catch (error) {
    throw new Error(error)
  }
}

export const InvitationService = {
  createNewBoardInvitation
}


