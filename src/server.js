require('dotenv').config()

const express = require('express')
const jsonServer = require('json-server')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { apiRouter } = require('./api')
const { authRouter } = require('./auth')
const path = require('path')
const jwt = require('jsonwebtoken')

const { randomThrottleMiddleware } = require('./middlewares')
const jsonServerMiddlewares = jsonServer.defaults()
const port = process.env.PORT || 5000

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

app.use(jsonServerMiddlewares)
app.use(randomThrottleMiddleware)

app.use(authRouter)
app.use(apiRouter)

app.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})
