import Queue from 'bull'
import { env } from '*/config/environtment'

// Function Khởi tạo một hàng đợi - queue với quequeName do chúng ta tự định nghĩa
const generateQueue = (queueName) => {
  try {
    return new Queue(queueName, {
      redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        username: env.REDIS_USERNAME,
        password: env.REDIS_PASSWORD
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

export const RedisQueueProvider = {
  generateQueue
}

