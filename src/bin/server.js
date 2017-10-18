#!/usr/bin/env node
const chalk = require('chalk')
require('dotenv').config()
const { server: { port, host } } = require('../config')

const app = require('../app')

process.once('SIGINT', () => app.shutDown())
process.once('SIGHUP', () => app.shutDown())
process.once('SIGTERM', () => app.shutDown())

// handle uncaught promises
process.on('unhandledRejection', function(reason, p) {
  console.log(`unhandled promise rejection: ${reason}`, p)
  console.dir(p, { depth: null })
})

// handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(err)
  process.exit(1)
})

app.server.listen(port)

app.server.on('error', onError)
app.server.on('listening', onListening)

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

function onListening() {
  const addr = app.server.address()
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  console.log(chalk.greenBright('[API] 🚀 Listening on ' + bind))
}
