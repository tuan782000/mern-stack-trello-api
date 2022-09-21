import { CardModel } from '*/models/card.model'
import { ColumnModel } from '*/models/column.model'
import { CloudinaryProvider } from '*/providers/CloudinaryProvider'
import { ObjectId } from 'mongodb'

const createNew = async (data) => {
  try {
    const createdCard = await CardModel.createNew(data)
    const getNewCard = await CardModel.findOneById(createdCard.insertedId.toString())

    await ColumnModel.pushCardOrder(getNewCard.columnId.toString(), getNewCard._id.toString())

    return getNewCard
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (cardId, data, user, cover = null) => {
  try {
    const updateData = {
      ...data,
      updatedAt: Date.now()
    }

    let updatedCard = {}
    if (cover) {
      const uploadResult = await CloudinaryProvider.streamUpload(cover.buffer, 'card-covers')
      updatedCard = await CardModel.update(cardId, { cover: uploadResult.secure_url })
    } else if (updateData.newComment) {
      const comment = {
        userId: ObjectId(user._id),
        userEmail: user.email,
        createdAt: Date.now(),
        ...updateData.newComment
      }
      updatedCard = await CardModel.pushNewComment(cardId, comment)
    } else {
      updatedCard = await CardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) {
    throw new Error(error)
  }
}

export const CardService = {
  createNew,
  update
}
