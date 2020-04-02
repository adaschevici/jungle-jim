const fs = require('fs')
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('data/data.json')
const middlewares = jsonServer.defaults()

const serverPort = 4242

const isAuthorized = req => {
  const data = fs.readFileSync('valid.json')

  const { password_hash } = JSON.parse(data.toString())
  return password_hash === req.headers['token']
}

const randomThrottleMiddleware = (req, res, next) => {
  const delay = Math.ceil(Math.random() * 10000)
  if (delay % 7 === 0) {
    setTimeout(() => next(), delay)
  } else {
    next()
  }

}

server.use(middlewares)
server.use(randomThrottleMiddleware)
server.use((req, res, next) => {
 if (isAuthorized(req)) { // add your authorization logic here
   next() // continue to JSON Server router
 } else {
   res.sendStatus(401)
 }
})

server.use(router)
server.listen(serverPort, () => {
  console.log(`JSON Server is running at port ${serverPort}`)
})
