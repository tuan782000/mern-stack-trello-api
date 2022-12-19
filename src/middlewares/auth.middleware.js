import { HttpStatusCode } from '*/utilities/constants'
import { JwtProvider } from '../providers/jwtProvider'
import { env } from '*/config/environtment'

const isAuthorized = async (req, res, next) => {
  const clientAccessToken = req.cookies?.accessToken
  if (!clientAccessToken) {
    // Không tìm thấy token trong request
    return res.status(HttpStatusCode.UNAUTHORIZED).json({ errors: 'Unauthorized (token not found).' })
  }

  try {
    // Thực hiện giải mã token xem nó có hợp lệ hay không
    const decoded = await JwtProvider.verifyToken(env.ACCESS_TOKEN_SECRET_SIGNATURE, clientAccessToken)

    // Quan Trọng: Nếu token hợp lệ, lưu thông tin giải mã được vào đối tượng req, dùng cho các xử lý ở phía sau.
    req.jwtDecoded = decoded

    // Tiếp tục cho phép req đi sang validation, controler, service...
    next()
  } catch (error) {
    if (error?.message?.includes('jwt expired')) {
      // Check error là expired, chọn mã 410
      return res.status(HttpStatusCode.EXPIRED).json({ errors: 'Need to refresh token.' })
    }
    // Trường hợp access_token không hợp lệ do bất kỳ lý do nào khác như sửa đổi hay sai lệch...vv thì trả về 401 cho client gọi api logout luôn.
    return res.status(HttpStatusCode.UNAUTHORIZED).json({ errors: 'Unauthorized.' })
  }
}

export const AuthMiddleware = {
  isAuthorized
}