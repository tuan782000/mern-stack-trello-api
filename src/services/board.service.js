import { BoardModel } from '*/models/board.model'
import { cloneDeep } from 'lodash'
import { DEFAULT_CURRENT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '*/utilities/constants'

const createNew = async (data, userId) => {
  try {
    const createdBoard = await BoardModel.createNew(data, userId)
    const getNewBoard = await BoardModel.findOneById(createdBoard.insertedId.toString())
    // push notification
    // do something...vv
    // transform data

    return getNewBoard
  } catch (error) {
    throw new Error(error)
  }
}

const getFullBoard = async (boardId, userId) => {
  try {
    const board = await BoardModel.getFullBoard(boardId)
    if (!board || !board.columns) {
      throw new Error('Board not found!')
    }

    const transformBoard = cloneDeep(board)

    // Để tạm 2 dòng if ở đây vì lúc dev tạo data cho board đang thiếu, nếu chuẩn data thì luôn luôn có ownerIds và memberIds với ít nhất là Array rỗng.
    if (!transformBoard.ownerIds) transformBoard['ownerIds'] = []
    if (!transformBoard.memberIds) transformBoard['memberIds'] = []

    if (!transformBoard.ownerIds.map(i => i.toString()).includes(userId) &&
      !transformBoard.memberIds.map(i => i.toString()).includes(userId))
    {
      throw new Error('You have no right to access this board!')
    }

    // Filter deteled columns
    transformBoard.columns = transformBoard.columns.filter(column => !column._destroy)

    // Add card to each column
    transformBoard.columns.forEach(column => {
      column.cards = transformBoard.cards.filter(c => c.columnId.toString() === column._id.toString())
    })
    // Sort columns by columnOrder, sort cards bt cardOrder, this step will pass to frontend DEV =))
    // Remove cards data from boards
    delete transformBoard.cards

    return transformBoard
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: Date.now()
    }
    if (updateData._id) delete updateData._id
    if (updateData.columns) delete updateData.columns

    const updatedBoard = await BoardModel.update(id, updateData)

    return updatedBoard
  } catch (error) {
    throw new Error(error)
  }
}

const getListBoards = async (userId, currentPage = DEFAULT_CURRENT_PAGE, itemsPerPage = DEFAULT_ITEMS_PER_PAGE, queryFilters) => {
  try {
    const boards = await BoardModel.getListBoards(userId, parseInt(currentPage), parseInt(itemsPerPage), queryFilters)

    return boards
  } catch (error) {
    throw new Error(error)
  }
}

export const BoardService = {
  createNew,
  update,
  getFullBoard,
  getListBoards
}
