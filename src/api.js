require('dotenv').config()

const jsonServer = require('json-server')
const apiRouter = jsonServer.router('data/data.json')

module.exports = {
  apiRouter,
}
