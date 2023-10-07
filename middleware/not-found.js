import { StatusCodes } from 'http-status-codes'

export const NotFoundMiddleware = (req, rest) =>
  res.status(StatusCodes.NOT_FOUND).send('route does not exist')