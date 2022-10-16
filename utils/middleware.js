/* eslint-disable no-undef */
const morgan = require('morgan')
const createError = require('http-errors')
const logger = require('../utils/logger')

const stream = {
  write: (message) => logger.http(message),
}

const skip = () => {
  const env = process.env.NODE_ENV || 'development'
  return env !== 'development'
}

const loggingMiddleware = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',

  { stream, skip }
)

const endPoint404 = (req, res, next) => {
  next(createError(404))
}

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return res.status(404).json({ error: error.message })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

module.exports = {
  loggingMiddleware, endPoint404, errorHandler
}
