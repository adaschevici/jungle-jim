require('dotenv').config()

const jsonServer = require('json-server')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const server = require('json-server').create()
const router = jsonServer.router('data/data.json')
const bcrypt = require('bcrypt')
const chalk = require('chalk')

const {
  randomThrottleMiddleware,
  authRequiredMiddleware,
  withAuth,
} = require('./middlewares')
const jsonServerMiddlewares = jsonServer.defaults()

const port = process.env.PORT
const basePath = process.env.BASE_PATH
const secret = process.env.SECRET

server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())
server.use(cookieParser())

server.use(jsonServerMiddlewares)
server.use(authRequiredMiddleware)
server.use(randomThrottleMiddleware)

server.post('/auth/register', async (req, res) => {
  const { email, password } = req.body
  const rounds = process.env.SALT_ROUNDS || 12
  const passHash = await bcrypt.hash(password, rounds)
  const create = () =>
    axios.post(`${basePath}:${port}/users`, {
      id: email,
      passwordHash: passHash,
    })
  const rollback = () => axios.delete(`${basePath}:${port}/users/${email}`)
  const initializeBookProgress = () =>
    axios.post(`${basePath}:${port}/book-progress`, {
      id: email,
      books: [],
    })
  create()
    .then(() =>
      initializeBookProgress()
        .then(() => {
          console.log(chalk.green('Initialized book progress'))
          return res.status(201).json({
            success: 'User successfully created and book list initialized :D',
          })
        })
        .catch((err) => {
          console.log(chalk.red(err))
          rollback()
            .then(() =>
              console.warn(
                chalk.yellow(
                  'User rolled back because of failure, failed to create books in progress'
                )
              )
            )
            .then(() =>
              console.log(
                chalk.red(`Unable to initialize books list for user ${err}`)
              )
            )
            .then(() =>
              res
                .status(500)
                .json({ failed: `Unable to create user, failed with ${err}` })
            )
        })
    )
    .catch((err) =>
      res
        .status(500)
        .json({ failed: `Unable to create user, failed with ${err}` })
    )
})

server.post('/auth/authenticate', async (req, res) => {
  const { email, password } = req.body
  axios
    .get(`${basePath}:${port}/users/${email}`)
    .then(async ({ data }) => {
      const passwordMatches = await bcrypt.compare(password, data.passwordHash)
      if (!passwordMatches) {
        return res.status(401).json({ error: 'Incorrect password' })
      }
      const payload = { email }
      const token = jwt.sign(payload, secret, {
        expiresIn: '1h',
      })
      return res.cookie('token', token, { httpOnly: true }).sendStatus(200)
    })
    .catch(({ response }) => {
      const { status } = response || { status: 418 }
      switch (status) {
        case 500:
          return res.status(500).json({
            error: 'Internal error fetching user data :(',
          })
        case 404:
          return res.status(404).json({
            error: 'User with email doesnt exist :(, maybe typo?',
          })
        default:
          return res.status(500).json({
            error: 'No clue why this happened ?!',
          })
      }
    })
})

server.post('/auth/check-token', withAuth, (req, res) => {
  return res.status(200).json({
    username: req.email,
  })
})

server.use(router)

server.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})
