import { HttpStatusCode } from '*/utilities/constants'
import { BoardService } from '*/services/board.service'

const createNew = async (req, res) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await BoardService.createNew(req.body, userId)

    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const getFullBoard = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.jwtDecoded._id

    const result = await BoardService.getFullBoard(id, userId)
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
    const result = await BoardService.update(id, req.body)

    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const getListBoards = async (req, res) => {
  try {
    const { currentPage, itemsPerPage, q } = req.query
    const queryFilters = q

    const userId = req.jwtDecoded._id
    const result = await BoardService.getListBoards(userId, currentPage, itemsPerPage, queryFilters)

    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

export const BoardController = {
  createNew,
  getFullBoard,
  update,
  getListBoards
}