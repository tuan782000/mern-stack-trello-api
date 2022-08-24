import { HttpStatusCode } from '*/utilities/constants'
import { UserService } from '*/services/user.service'

const createNew = async (req, res) => {
  try {
    const result = await UserService.createNew(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const verifyAccount = async (req, res) => {
  try {
    const result = await UserService.verifyAccount(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const signIn = async (req, res) => {
  try {
    const result = await UserService.signIn(req.body)

    //Xu ly cookiees
    res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: true, sameSite: 'none' })
    res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: true, sameSite: 'none' })

    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const signOut = async (req, res) => {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(HttpStatusCode.OK).json({ signedOut: true })
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

export const UserController = {
  createNew,
  verifyAccount,
  signIn,
  signOut
}
