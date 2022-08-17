import JWT from 'jsonwebtoken'

// Tạo mới một token
const generateToken = async (secretSignature, tokenLife, user = {}) => {
  try {
    return await JWT.sign(user, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

// Kiểm tra một token có hợp lệ hay không
const verifyToken = async (secretSignature, token) => {
  try {
    return await JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}