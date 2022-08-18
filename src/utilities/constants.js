import { env } from '*/config/environtment'

export const HttpStatusCode = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  EXPIRED: 410,
  INTERNAL_SERVER: 500
}

export const WHITELIST_DOMAINS = [
  'http://localhost:3000',
  'https://trello-trungquandev-web.web.app'
]

export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/

let websiteDomain = 'http://localhost:3000'
if (env.BUILD_MODE === 'production') websiteDomain = 'https://trungquandev.com'
// if (env.BUILD_MODE === 'dev') websiteDomain = 'http://localhost:3000'
export const WEBSITE_DOMAIN = websiteDomain