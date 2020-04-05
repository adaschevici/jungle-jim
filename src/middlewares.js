const fs = require('fs')

const isAuthorized = (req) => {
  const data = fs.readFileSync(`${__dirname}/valid.json`)

  const { password_hash } = JSON.parse(data.toString())
  return password_hash === req.headers['token']
}

const urlFragments = ['^/images/', '^/meta/', '^/ratings/'].map(
  (fragment) => new RegExp(fragment)
)

const throttled = (url) => {
  for (let check of urlFragments) {
    if (url.match(check)) {
      return true
    }
  }
  return false
}

const randomThrottleMiddleware = (req, res, next) => {
  const delay = Math.ceil(Math.random() * 10000)

  if (throttled(req.url) && delay % 7 === 0) {
    setTimeout(() => next(), delay)
  } else {
    next()
  }
}

const withAuth = function (req, res, next) {
  const token = req.cookies.token
  if (!token) {
    res.status(401).send('Unauthorized: No token provided')
  } else {
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token')
      } else {
        req.email = decoded.email
        next()
      }
    })
  }
}

module.exports = {
  randomThrottleMiddleware,
  withAuth,
}
