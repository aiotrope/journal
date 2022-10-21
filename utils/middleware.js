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
    return res.status(400).json({ error: `${error.name}: invalid ${error.path} using ${error.value}` })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }else if (error.name === 'NotFoundError') {
    return res.status(404).json({ error: error.message })
  }else if (error.name === 'MongoServerError') {
    return res.status(422).json({
      error: `duplicate username ${req.body.username} cannot be registered!`,
    })
  }else if(error.name === 'TypeError') {
    return res.status(400).json({ error: error.message })
  }else if(error.message === 'title cannot be blank!') {
    return res.status(400).json({ error: error.message })
  }else if(error.message === 'url cannot be empty!') {
    return res.status(400).json({ error: error.message })
  }else if(error.message === 'there is a problem updating blog!') {
    return res.status(400).json({ error: error.message })
  }else if(error.message === 'invalid id!') {
    return res.status(400).json({ error: error.message })
  }else if(error.message === 'no blog found!') {
    return res.status(404).json({ error: error.message })
  }else if(error.message === 'cannot delete unknown blog!') {
    return res.status(404).json({ error: error.message })
  }else if(error.message === 'there were no blog found!') {
    return res.status(404).json({ error: error.message })
  }else if(error.message === 'password was not valid!') {
    return res.status(400).json({ error: error.message })
  }else if(error.message === 'password is required!') {
    return res.status(400).json({ error: error.message })
  }


  next(error)
}

module.exports = {
  loggingMiddleware, errorHandler, endPoint404
}
