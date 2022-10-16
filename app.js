const config = require('./utils/config')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()

const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

const blogRouter = require('./controllers/blog')

const dbURL = config.mongo_url

const opts = {
  autoIndex: true,
  useNewUrlParser: true,
}

mongoose
  .connect(dbURL, opts)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('connection error: ', error.message)
  })

app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use(cors())

app.use(express.static('build'))

app.use(middleware.loggingMiddleware)

app.use('/api/blogs', blogRouter)

app.use(middleware.endPoint404)

app.use(middleware.errorHandler)


module.exports = app
