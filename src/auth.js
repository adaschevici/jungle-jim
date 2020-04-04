require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const jwt = require('jsonwebtoken')

const authPort = process.env.AUTH_PORT || 5000
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

const routes = require('express').Router()

routes.get('/test-route', (req, res) => {
  res.status(200).json({ reply: 'Happy reply :D' })
})

app.use(routes)

app.listen(authPort, () => {
  console.log(`Auth Server is running at port ${authPort}`)
})
