import { UserModel } from '*/models/user.model'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pick } from 'lodash'

const createNew = async (data) => {
  try {
    const exitUser = await UserModel.findOneByAny('email', data.email)
    if (exitUser) {
      throw new Error('Email already exist.')
    }

    // Tạo data để lưu vào DB
    // trungquandev@gmail.com
    const username = data.email.split('@')[0] || ''
    const user = {
      email: data.email,
      password: bcryptjs.hashSync(data.password, 17),
      username: username,
      displayName: username,
      verifyToken: uuidv4()
    }

    const createdUser = await UserModel.createNew(user)
    const getUser = await UserModel.findOneByAny('_id', createdUser.insertedId.toString())

    //send Email

    return pick(getUser, ['_id', 'email', 'username', 'displayName'])
  } catch (error) {
    throw new Error(error)
  }
}

export const UserService = {
  createNew
}
