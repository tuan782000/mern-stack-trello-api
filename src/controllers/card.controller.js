import { HttpStatusCode } from '*/utilities/constants'
import { CardService } from '*/services/card.service'

const createNew = async (req, res) => {
  try {
    const result = await CardService.createNew(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.jwtDecoded
    const result = await CardService.update(id, req.body, user, req.file)

    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

export const CardController = {
  createNew,
  update
}
