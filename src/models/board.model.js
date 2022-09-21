import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'
import { ColumnModel } from './column.model'
import { CardModel } from './card.model'
import { UserModel } from './user.model'
import { pagingSkipValue } from '*/utilities/algorithm'

// Define Board collection
const boardCollectionName = 'boards'
const boardCollectionSchema = Joi.object({
  title: Joi.string().required().min(3).max(50).trim(),

  description: Joi.string().required().min(3).max(256).trim(),
  ownerIds: Joi.array().items(Joi.string()).default([]),
  memberIds: Joi.array().items(Joi.string()).default([]),

  columnOrder: Joi.array().items(Joi.string()).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp().default(null),
  _destroy: Joi.boolean().default(false)
})

const ALLOW_UPDATE_FIELDS = ['title', 'description', 'ownerIds', 'memberIds', 'columnOrder', 'updatedAt', '_destroy']

const validateSchema = async (data) => {
  return await boardCollectionSchema.validateAsync(data, { abortEarly: false })
}

const findOneById = async (id) => {
  try {
    const result = await getDB().collection(boardCollectionName).findOne({ _id: ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const createNew = async (data, userId) => {
  try {
    const value = await validateSchema(data)
    const createData = {
      ...value,
      ownerIds: [ObjectId(userId)]
    }
    const result = await getDB().collection(boardCollectionName).insertOne(createData)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    const updateData = { ...data }

    // Quan trọng: Lọc những field không được phép cập nhật:
    Object.keys(updateData).forEach(key => {
      if (!ALLOW_UPDATE_FIELDS.includes(key)) delete updateData[key]
    })

    const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * @param {string} boardId
 * @param {string} columnId
 */
const pushColumnOrder = async (boardId, columnId) => {
  try {
    const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
      { _id: ObjectId(boardId) },
      { $push: { columnOrder: columnId } },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const getFullBoard = async (boardId) => {
  try {
    const result = await getDB().collection(boardCollectionName).aggregate([
      { $match: {
        _id: ObjectId(boardId),
        _destroy: false
      } },
      { $lookup: {
        from: ColumnModel.columnCollectionName,
        localField: '_id',
        foreignField: 'boardId',
        as: 'columns'
      } },
      { $lookup: {
        from: CardModel.cardCollectionName,
        localField: '_id',
        foreignField: 'boardId',
        as: 'cards'
      } },
      { $lookup: {
        from: UserModel.userCollectionName,
        localField: 'ownerIds',
        foreignField: '_id',
        as: 'owners',
        pipeline: [
          { $project: { 'password': 0, 'verifyToken': 0 } }
        ]
      } },
      { $lookup: {
        from: UserModel.userCollectionName,
        localField: 'memberIds',
        foreignField: '_id',
        as: 'members',
        pipeline: [
          { $project: { 'password': 0, 'verifyToken': 0 } }
        ]
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) {
    throw new Error(error)
  }
}
const getListBoards = async (userId, currentPage, itemsPerPage, queryFilters) => {
  try {
    let queryConditions = [
      { $or: [
        { ownerIds: { $all: [ObjectId(userId)] } },
        { memberIds: { $all: [ObjectId(userId)] } }
      ] },
      { _destroy: false }
    ]

    if (queryFilters) {
      Object.keys(queryFilters).forEach(key => {
        //queryConditions.push({ [key]: { $regex: queryFilters[key] } }) // có phân biệt chữ hoa thường
        queryConditions.push({ [key]: { $regex: new RegExp(queryFilters[key], 'i') } }) // không phân biệt hoa thường
      })
    }

    const query = await getDB().collection(boardCollectionName).aggregate([
      { $match: { $and: queryConditions } },
      { $facet: {
        'data': [
          { $skip: pagingSkipValue(currentPage, itemsPerPage) },
          { $limit: itemsPerPage },
          { $sort: { title: 1 } }
        ],
        'totalData': [
          { $count: 'count' }
        ]
      } }
    ]).toArray()

    const res = query[0]

    return {
      results: res.data || [],
      totalResults: res.totalData[0]?.count || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const BoardModel = {
  createNew,
  update,
  pushColumnOrder,
  getFullBoard,
  findOneById,
  getListBoards
}
