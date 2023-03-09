const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})
const { v4: uuidV4 } = require('uuid')
const PORT = process.env.PORT || 3001

console.log('welcome')
app.use(express.static('public'))
app.get('/', (req, res) => {
  const uuid = uuidV4()
  console.log('freqency: ', uuid)
  res.send(`${uuid}`)
})

const rooms = {}

io.on('connection', socket => {
  console.log('socket connected!', socket.id)

  socket.on('join-freq', freqID => {
    console.log('join-freq', { freqID })
    // ====================== 2. Join or create room with userID ======================

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
    const otherUserID = rooms[freqID].find(id => id !== socket.id)
    console.log(rooms)
    console.log({ otherUserID })
    // ====================== 3. If there is other user, emit to JoinFreq ======================
    if (otherUserID) {
      socket.emit('other-user', otherUserID)
      socket.to(otherUserID).emit('user-joined', socket.id)
    }
    /*
        The initiating peer offers a connection
    */
    // ====================== 11. Listener to incoming Offer ======================
    socket.on('offer', payload => {
      console.log('[SERVER] offer ')
      // ====================== 12. Emit offer to targeted user ======================
      io.to(payload.target).emit('offer', payload)
    })

    /*
        The receiving peer answers (accepts) the offer
    */
    // ====================== 17. Listen to incoming answer ======================
    socket.on('answer', payload => {
      console.log('[SERVER] answer')
      // ====================== 18. Emit answer to targeted user ======================
      io.to(payload.target).emit('answer', payload)
    })

    // =========== 23. Listen to incoming ice candidate ============
    socket.on('ice-candidate', incoming => {
      console.log('[SERVER] ice-candidate')
      // =========== 24. Emit ice candidate to tageted user ============
      io.to(incoming.target).emit('ice-candidate', incoming)
    })

    socket.on('end', incoming => {
      console.log('[SERVER] end')
      io.emit('end')
    })

    socket.on('switch-camera', () => {
      console.log('[SERVER] Switching Camera')
      io.emit('switch-camera')
    })

    socket.on('toggle-audio', () => {
      console.log('[SERVER] Toggle audio')
      io.emit('toggle-audio')
    })
    // socket.emit('user', userId)
    // socket.to(freqID).emit('user-connected', userId)
  })
})

server.listen(PORT, () => console.log('server is running @', PORT))
