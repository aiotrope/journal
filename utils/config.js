/* eslint-disable no-undef */
const dotenv = require('dotenv')

dotenv.config()

const port = process.env.PORT
const mongo_url = process.env.MONGO_URL
const log_level = process.env.LOG_LEVEL

const config = {
  port,
  log_level,
  mongo_url,
}

module.exports = config
