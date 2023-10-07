import {
  BadRequestError,
  UnAuthenticatedError,
  UnAuthorizedError,
} from '../errors/custom-errors.js'
import { verifyJWT } from '../utils/tokenUtils.js'

export const authenticatedUser = (req, res, next) => {
  const { token } = req.cookies
  if (!token) throw new UnAuthenticatedError('authentication invalid')
  try {
    const { userId, role } = verifyJWT(token)
    req.user = { userId, role }
    next()
  } catch (error) {
    throw new UnAuthenticatedError('authentication invalid')
  }
}

export const authorizedPermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new UnAuthorizedError('Unauthorized to access this route')
    next()
  }
}

export const checkForTestUser = (req, res, next) => {
  if (req.user.testUser) throw new BadRequestError('Test User. Read Only!')
  next()
}