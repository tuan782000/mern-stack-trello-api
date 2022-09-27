import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'
import { UserModel } from './user.model'
import { BoardModel } from './board.model'

const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}
const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

// Define invitation collection
const invitationCollectionName = 'invitations'
const invitationCollectionSchema = Joi.object({
  inviterId: Joi.string().required(),
  inviteeId: Joi.string().required(),
  type: Joi.string().required(), //INVITATION_TYPES at below
  boardInvitation: {
    boardId: Joi.string(),
    status: Joi.string().default(BOARD_INVITATION_STATUS.PENDING)
  },

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp().default(null),
  _destroy: Joi.boolean().default(false)
})

const ALLOW_UPDATE_FIELDS = ['boardInvitation', 'updatedAt', '_destroy']

const validateSchema = async (data) => {
  return await invitationCollectionSchema.validateAsync(data, { abortEarly: false })
}

const findOneById = async (id) => {
  try {
    const result = await getDB().collection(invitationCollectionName).findOne({ _id: ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const createNewBoardInvitation = async (data) => {
  try {
    const validatedValue = await validateSchema(data)
    const insertValue = {
      ...validatedValue,
      inviterId: ObjectId(validatedValue.inviterId),
      inviteeId: ObjectId(validatedValue.inviteeId),
      boardInvitation: {
        ...validatedValue.boardInvitation,
        boardId: ObjectId(validatedValue.boardInvitation.boardId)
      }
    }

    const result = await getDB().collection(invitationCollectionName).insertOne(insertValue)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    const updateData = { ...data }

    Object.keys(updateData).forEach(key => {
      if (!ALLOW_UPDATE_FIELDS.includes(key)) delete updateData[key]
    })

    const result = await getDB().collection(invitationCollectionName).findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const findByUser = async (userId) => {
  try {
    const results = await getDB().collection(invitationCollectionName).aggregate([
      { $match: {
        inviteeId: ObjectId(userId),
        _destroy: false
      } },
      { $lookup: {
        from: UserModel.userCollectionName,
        localField: 'inviterId',
        foreignField: '_id',
        as: 'inviter',
        pipeline: [
          { $project: { 'password': 0, 'verifyToken': 0 } }
        ]
      } },
      { $lookup: {
        from: UserModel.userCollectionName,
        localField: 'inviteeId',
        foreignField: '_id',
        as: 'invitee',
        pipeline: [
          { $project: { 'password': 0, 'verifyToken': 0 } }
        ]
      } },
      { $lookup: {
        from: BoardModel.boardCollectionName,
        localField: 'boardInvitation.boardId',
        foreignField: '_id',
        as: 'board',
        pipeline: [
          { $project: { 'title': 1 } }
        ]
      } }
    ]).toArray()

    return results
  } catch (error) {
    throw new Error(error)
  }
}

export const InvitationModel = {
  invitationCollectionName,
  createNewBoardInvitation,
  update,
  findOneById,
  INVITATION_TYPES,
  BOARD_INVITATION_STATUS,
  findByUser
}

