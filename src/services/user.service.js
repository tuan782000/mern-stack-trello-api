import { UserModel } from '*/models/user.model'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pick } from 'lodash'
import { SendInBlueProvider } from '../providers/SendInBlueProvider'
import { WEBSITE_DOMAIN } from '../utilities/constants'
import { JwtProvider } from '../providers/jwtProvider'
import { env } from '*/config/environtment'


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
      password: bcryptjs.hashSync(data.password, 8),
      username: username,
      displayName: username,
      verifyToken: uuidv4()
    }

    const createdUser = await UserModel.createNew(user)
    const getUser = await UserModel.findOneByAny('_id', createdUser.insertedId.toString())

    //send Email
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getUser.email}&token=${getUser.verifyToken}`
    const subject = 'Trello Clone App: Please verify your email before using our services!'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,<br/> - TuanNguyenDev - </h3>
    `
    await SendInBlueProvider.sendEmail(getUser.email, subject, htmlContent)

    return pick(getUser, ['_id', 'email', 'username', 'displayName'])
  } catch (error) {
    throw new Error(error)
  }
}

const verifyAccount = async (data) => {
  try {
    const exitUser = await UserModel.findOneByAny('email', data.email)
    if (!exitUser) {
      throw new Error('Email not found.')
    }

    if (exitUser.isActive) {
      throw new Error('Your Account is already active.')
    }

    if (data.token !== exitUser.verifyToken) {
      throw new Error('Invalid Token.')
    }

    const updatedUser = await UserModel.update(exitUser._id.toString(), {
      verifyToken: null,
      isActive: true
    })

    return pick(updatedUser, ['_id', 'email', 'username', 'displayName'])
  } catch (error) {
    throw new Error(error)
  }
}

const signIn = async (data) => {
  try {
    const exitUser = await UserModel.findOneByAny('email', data.email)
    if (!exitUser) {
      throw new Error('Email not found.')
    }

    if (!exitUser.isActive) {
      throw new Error('Your Account is not active.')
    }

    //compare password
    if (!bcryptjs.compareSync(data.password, exitUser.password)) {
      throw new Error('Your Email or password is incorrect.')
    }

    // xu ly JWT token
    const accessToken = await JwtProvider.generateToken(
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_SECRET_LIFE,
      {_id: exitUser._id, email: exitUser.email}
    )

    const refreshToken = await JwtProvider.generateToken(
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_SECRET_LIFE,
      {_id: exitUser._id, email: exitUser.email}
    )

    const resUser = pick(exitUser, ['_id', 'email', 'username', 'displayName'])

    return { accessToken, refreshToken, ...resUser }
  } catch (error) {
    throw new Error(error)
  }
}
export const UserService = {
  createNew,
  verifyAccount,
  signIn
}
