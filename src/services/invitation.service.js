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

const getInvitations = async (userId) => {
  try {
    const getInvitations = await InvitationModel.findByUser(userId)

    const resInvitations = getInvitations.map(i => {
      return {
        ...i,
        inviter: i.inviter[0] || {},
        invitee: i.invitee[0] || {},
        board: i.board[0] || {}
      }
    })

    return resInvitations
  } catch (error) {
    throw new Error(error)
  }
}

const updateBoardInvitation = async (userId, invitationId, action) => {
  try {
    // Tìm cái bản ghi intivation trong model
    const getInvitation = await InvitationModel.findOneById(invitationId)
    if (!getInvitation) {
      throw new Error('Invitation not found!')
    }

    // Kiểm tra xem nếu hành động là Accept join board mà cái thằng user đã là owner hoặc member của board rồi thì show thông báo.
    const board = await BoardModel.findOneById(getInvitation.boardInvitation.boardId.toString())
    const boardMemberIds = board.memberIds.toString()
    const boardOwnerIds = board.ownerIds.toString()
    if (action === 'accept' && (boardMemberIds.includes(userId) || boardOwnerIds.includes(userId))) {
      throw new Error('You are already a member of this board!')
    }

    // Khởi tạo một cái status, giá trị mặc định là PENDING
    let status = InvitationModel.BOARD_INVITATION_STATUS.PENDING
    // Dựa theo action để gán đúng lại giá trị cho status
    if (action === 'accept') status = InvitationModel.BOARD_INVITATION_STATUS.ACCEPTED
    if (action === 'reject') status = InvitationModel.BOARD_INVITATION_STATUS.REJECTED

    // Tạo một biến update data để cập nhật bản ghi Invitation
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status
      }
    }
    const updatedInvitation = await InvitationModel.update(invitationId, updateData)

    // Nếu trường hợp Accept một lời mời thành công, thì cần phải thêm thông tin của thằng user vào bản ghi members trong collection board.
    if (updatedInvitation.boardInvitation.status === InvitationModel.BOARD_INVITATION_STATUS.ACCEPTED) {
      await BoardModel.pushMembers(updatedInvitation.boardInvitation.boardId.toString(), userId)
    }

    // Trả về bản ghi invitation đã update thành công cho phía FE
    return updatedInvitation
  } catch (error) {
    throw new Error(error)
  }
}


export const InvitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}


