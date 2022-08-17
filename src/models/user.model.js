import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'

// Define User collection
const userCollectionName = 'users'
const userCollectionSchema = Joi.object({
  email: Joi.string().required(), // unique
  password: Joi.string().required(),
  username: Joi.string().required().trim(), // username sẽ không unique bởi vì sẽ có những đuôi email từ các nhà cũng cấp khác nhau

  displayName: Joi.string().required().trim(),
  avatar: Joi.string().default(null),

  role: Joi.string().default('client'),

  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp().default(null)
})

const ALLOW_UPDATE_FIELDS = ['password', 'displayName', 'avatar', 'isActive', 'verifyToken', 'updatedAt']

const validateSchema = async (data) => {
  return await userCollectionSchema.validateAsync(data, { abortEarly: false })
}

const findOneById = async (id) => {
  try {
    const result = await getDB().collection(userCollectionName).findOne({ _id: ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByAny = async (key, value) => {
  try {
    if (key === '_id') {
      value = ObjectId(value)
    }
    const result = await getDB().collection(userCollectionName).findOne({ [key]: value })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const createNew = async (data) => {
  try {
    const validatedValue = await validateSchema(data)
    const result = await getDB().collection(userCollectionName).insertOne(validatedValue)
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

    const result = await getDB().collection(userCollectionName).findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

export const UserModel = {
  userCollectionName,
  createNew,
  findOneById,
  findOneByAny,
  update
}