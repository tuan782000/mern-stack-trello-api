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
    // thaituan7820@gmail.com
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

    //Compare password
    if (!bcryptjs.compareSync(data.password, exitUser.password)) {
      throw new Error('Your Email or password is incorrect.')
    }

    // Xử lý JWT tokens
    const accessToken = await JwtProvider.generateToken(
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_SECRET_LIFE,
      // 10,
      { _id: exitUser._id, email: exitUser.email }
    )

    const refreshToken = await JwtProvider.generateToken(
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_SECRET_LIFE,
      // 15,
      { _id: exitUser._id, email: exitUser.email }
    )

    const resUser = pick(exitUser, ['_id', 'email', 'username', 'displayName'])

    return { accessToken, refreshToken, ...resUser }
  } catch (error) {
    throw new Error(error)
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(env.REFRESH_TOKEN_SECRET_SIGNATURE, clientRefreshToken)

    // Xử lý JWT tokens
    // Chỗ này vì chúng ta chỉ lưu những thông tin unique và cố định của user, vì vậy có thể lấy luôn từ refreshTokenDecoded ra, không cần query vào DB để lấy data mới
    const accessToken = await JwtProvider.generateToken(
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_SECRET_LIFE,
      // 10,
      { _id: refreshTokenDecoded._id, email: refreshTokenDecoded.email }
    )

    return { accessToken }
  } catch (error) {
    throw new Error(error)
  }
}

export const UserService = {
  createNew,
  verifyAccount,
  signIn,
  refreshToken
}
