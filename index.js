const app = require('./app')
const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')


const server = http.createServer(app)

const port = config.port
server.listen(port, () => {
  logger.info(`Server is running on port ${port}`)
})



