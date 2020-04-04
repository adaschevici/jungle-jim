require('dotenv').config()

const jsonServer = require('json-server')
const jwt = require('jsonwebtoken')
const { randomThrottleMiddleware, authMiddleware } = require('./middlewares')
const server = jsonServer.create()
const apiRouter = jsonServer.router('data/data.json')
const middlewares = jsonServer.defaults()

const serverPort = process.env.PORT || 4242

server.use(middlewares)
server.use(randomThrottleMiddleware)
server.use(authMiddleware)

server.use(apiRouter)

server.listen(serverPort, () => {
  console.log(`JSON Server is running at port ${serverPort}`)
})
