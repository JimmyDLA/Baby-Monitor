const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const PORT = process.env.PORT || 3000

console.log('welcome')
app.use(express.static('public'))
app.get('/', (req, res) => {
  const uuid = uuidV4()
  console.log('freqency: ', uuid)
  res.send(`${uuid}`)
})

// app.get('/:freq', (res, req) => {
//   res.render('freq', { freqId: req.params.freq })
// })

io.on('connection', socket => {
  console.log('connection!')
  socket.on('join-freq', (freqId, userId) => {
    console.log(freqId, userId)
    socket.join(freqId)
    // socket.emit('user', userId)
    socket.to(freqId).emit('user-connected', userId)
  })
})

server.listen(PORT, () => console.log('server is running @', PORT))
