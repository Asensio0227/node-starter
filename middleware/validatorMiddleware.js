import { body, param, validationResult } from 'express-validator'
import mongoose from 'mongoose'
import {
  BadRequestError,
  NotFoundError,
  UnAuthorizedError,
} from '../errors/custom-errors.js'
import Listing from '../models/ListingsModel.js'
import User from '../models/UserModel.js'

const withValidationErrors = validateValues => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg)

        const firstMessage = errorMessages[0]
        console.log(Object.getPrototypeOf(firstMessage))
        if (errorMessages[0].startsWith('no listing')) {
          throw new NotFoundError(errorMessages)
        }
        if (errorMessages[0].startsWith('not authorized')) {
          throw new UnAuthorizedError('not authorized to access this route')
        }
        throw new BadRequestError(errorMessages)
      }
      next()
    },
  ]
}

export const validateRegisterInput = withValidationErrors([
  body('name').notEmpty().withMessage('name is required'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format')
    .custom(async email => {
      const user = await User.findOne({ email })
      if (user) {
        throw new BadRequestError('email already exists')
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters long'),
  body('location').notEmpty().withMessage('location is required'),
])

export const validateLoginInput = withValidationErrors([
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters long')
    .custom(async (value, { req }) => {
      const user = await User.findOne({ _id: req.user.userId })
      const type = (value = req.body.password)
      const isPasswordCorrect = await user.ComparePassword(type)
      if (!isPasswordCorrect)
        throw new UnAuthenticatedError('Invalid credentials')
      if (user && user._id.toString() !== req.user.userId) {
        throw new BadRequestError(`No user with id: ${req.user.userId}`)
      }
    }),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format'),
])

export const validateUpdateUser = withValidationErrors([
  body('name').notEmpty().withMessage('name is required'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format')
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email })
      if (user && user._id.toString() !== req.user.userId) {
        throw new BadRequestError('email already exists')
      }
    }),

  body('location').notEmpty().withMessage('location is required'),
])

export const validateListingInput = withValidationErrors([
  body('title').notEmpty().withMessage('title is required'),
  body('description').notEmpty().withMessage('description is required'),
  body('avatar').notEmpty().withMessage('image is required'),
  body('price').notEmpty().withMessage('price is required'),
])

export const validateIdParam = withValidationErrors([
  param('id').custom(async (value, { req }) => {
    const isValidMongoId = mongoose.Types.ObjectId.isValid(value)
    if (!isValidMongoId) throw new BadRequestError('invalid MongoDB id')
    const listing = await Listing.findById(value)
    if (!listing) throw new NotFoundError(`no listing with id ${value}`)
    const isAdmin = req.user.role === 'admin'
    const isOwner = req.user.userId === listing.createdBy.toString()

    if (!isAdmin && !isOwner)
      throw new UnAuthorizedError('not authorized to access this route')
  }),
])

export const validatePassword = withValidationErrors([
  body('oldPassword').isLength({ min: 6 }),
  body('newPassword').custom(async (value, { req }) => {
    const user = await User.findOne({ _id: req.user.userId })
    const type = value === req.body.password
    const isPasswordCorrect = await user.ComparePassword(type)
    if (!isPasswordCorrect)
      throw new UnAuthenticatedError('Invalid credentials')
    if (user && user._id.toString() !== req.user.userId) {
      throw new BadRequestError(`No user with id: ${req.user.userId}`)
    }
  }),
])

export const validateUpdateListing = withValidationErrors([
  body('title').notEmpty().withMessage('name is required'),
  body('images').isArray(),
  body('location').notEmpty().withMessage('location is required'),
  body('description').notEmpty().withMessage('description is required'),
  body('price').notEmpty().withMessage('price is required'),
])