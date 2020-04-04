const fs = require('fs')

const isAuthorized = (req) => {
  const data = fs.readFileSync(`${__dirname}/valid.json`)

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

const authMiddleware = (req, res, next) => {
  if (isAuthorized(req)) {
    // add your authorization logic here
    next() // continue to JSON Server router
  } else {
    res.sendStatus(401)
  }
}

module.exports = {
  randomThrottleMiddleware,
  authMiddleware,
}
