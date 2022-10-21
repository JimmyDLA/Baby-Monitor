import React, { useEffect, useRef } from 'react'
import { View, Text } from 'react-native'
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc'
import io from 'socket.io-client'
import { v4 as uuidV4 } from 'uuid'

const URL = 'http://localhost:3000'
const room = uuidV4()

const CreateFreq = ({ startNewFrequency }) => {
  const peerRef = useRef()
  const socketRef = useRef()
  const otherUser = useRef()
  const sendChannel = useRef() // Data channel

  useEffect(() => {
    console.log('create freq useEffect', room)
    socketRef.current = io.connect(URL)
    startNewFrequency()
    // console.log({ room })
    socketRef.current.emit('join-freq', room) // Room ID

    // socketRef.current.on('other user', userID => {
    //   callUser(userID)
    //   otherUser.current = userID
    // })
  }, [])

  function callUser(userID) {
    // This will initiate the call for the receiving peer
    console.log("[INFO] Initiated a call")
    peerRef.current = Peer(userID)
    sendChannel.current = peerRef.current.createDataChannel("sendChannel")

    // listen to incoming messages from other peer
    sendChannel.current.onmessage = handleReceiveMessage
  }

  function Peer(userID) {
    /* 
       Here we are using Turn and Stun server
       (ref: https://blog.ivrpowers.com/post/technologies/what-is-stun-turn-server/)
    */

    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.stunprotocol.org',
        },
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com',
        },
      ],
    })
    peer.onicecandidate = handleICECandidateEvent
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID)
    return peer
  }

  return (
    <View style={styles.preview}>
      <Text>CREATE FREQUENCY</Text>
    </View>
  )
}

const styles = {
  input: {
    width: 200,
    height: 30,
    borderColor: 'black',
    borderWidth: 2,
    marginVertical: 10,
  },
  preview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'pink',
  },
  container: {
    width: '100%',
    height: 300,
    backgroundColor: 'white',
  },
}

export default CreateFreq
