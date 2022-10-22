/* eslint-disable no-undef */
const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
const helmet = require('helmet')
const app = express()

const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

const blogRouter = require('./controllers/blog')
const userRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')

const userExtractor = middleware.userExtractor

let dbURL

if (process.env.NODE_ENV === 'development') {
  dbURL = config.mongo_url_dev
}
if (process.env.NODE_ENV === 'test') {
  dbURL = config.mongo_url_test
}
if (process.env.NODE_ENV === 'production') {
  dbURL = config.mongo_url
}

const opts = {
  autoIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect(dbURL, opts)

const db = mongoose.connection
db.once('open', () => {
  logger.info(`Database connected: ${dbURL}`)
})

db.on('error', (error) => {
  logger.error(`connection error: ${error}`)
})

app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use(cors())

app.use(express.static('build'))

app.use(helmet())

app.use(middleware.loggingMiddleware)

app.use(middleware.tokenExtractor)

///app.use(middleware.userExtractor)

app.use('/api/blogs', userExtractor, blogRouter)

app.use('/api/users', userRouter)


app.use('/api/login', loginRouter)

app.use(middleware.endPoint404)

app.use(middleware.errorHandler)


module.exports = app
