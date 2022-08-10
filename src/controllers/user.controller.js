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

export const UserController = {
  createNew
}
