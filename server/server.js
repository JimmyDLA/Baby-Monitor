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
//   res.render('freq', { freqID: req.params.freq })
// })
const rooms = {}

io.on('connection', socket => {
  console.log('socket connected!')

  socket.on('join-freq', freqID => {
    console.log(freqID)

    if (rooms[freqID]) {
      // Join exisiting room
      rooms[freqID].push(socket.id)
    } else {
      // Create new rooom
      rooms[freqID] = [socket.id]
    }
    /*
        If both initiating and receiving peer joins the room,
        we will get the other user details.
        For initiating peer it would be receiving peer and vice versa.
    */
    console.log(rooms)
    const otherUser = rooms[freqID].find(id => id !== socket.id)
    if (otherUser) {
      socket.emit('other-user', otherUser)
      socket.to(otherUser).emit('user-joined', socket.id)
    }
    // socket.emit('user', userId)
    // socket.to(freqID).emit('user-connected', userId)
  })
})

server.listen(PORT, () => console.log('server is running @', PORT))
