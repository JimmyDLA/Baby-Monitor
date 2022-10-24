import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useTheme } from '@/Hooks'

const URL = 'http://localhost:3000'

const JoinFreq = ({ room }) => {
  const { Common, Fonts, Gutters } = useTheme()

  console.log(room)
  const peerRef = useRef()
  const socketRef = useRef()
  const otherUser = useRef()
  const sendChannel = useRef() // Data channel

  const [msg, setMsg] = useState('')
  useEffect(() => {
    console.log('JoinFreq useEffect')
    socketRef.current = io.connect(URL)
    socketRef.current.emit('join-freq', room)
    // Step 3: Waiting for the other peer to join the room
    socketRef.current.on('other-user', userID => {
      callUser(userID)
      otherUser.current = userID
    })
    // Signals that both peers have joined the room
    socketRef.current.on('user-joined', userID => {
      otherUser.current = userID
    })

    socketRef.current.on('offer', handleOffer)

    socketRef.current.on('answer', handleAnswer)

    socketRef.current.on('ice-candidate', handleNewICECandidateMsg)
  }, [])

  function callUser(userID) {
    // This will initiate the call for the receiving peer
    console.log('[INFO] Initiated a call')
    peerRef.current = Peer(userID)
    debugger

    sendChannel.current = peerRef.current.createDataChannel('sendChannel')

    // listen to incoming messages from other peer
    sendChannel.current.onmessage = handleReceiveMessage
  }

  function Peer(userID) {
    /*
      Here we are using Turn and Stun server
      (ref: https://blog.ivrpowers.com/post/technologies/what-is-stun-turn-server/)
    */
    debugger
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    debugger
    console.log({ peer })

    peer.onicecandidate = handleICECandidateEvent
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID)
    return peer
  }

  function handleNegotiationNeededEvent(userID) {
    // Offer made by the initiating peer to the receiving peer.
    debugger
    peerRef.current
      .createOffer()
      .then(offer => {
        return peerRef.current.setLocalDescription(offer)
      })
      .then(() => {
        const payload = {
          target: userID,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        }
        socketRef.current.emit('offer', payload)
      })
      .catch(err => console.log('Error handling negotiation needed event', err))
  }

  function handleOffer(incoming) {
    /*
      Here we are exchanging config information
      between the peers to establish communication
    */
    console.log('[INFO] Handling Offer')
    peerRef.current = Peer()
    peerRef.current.ondatachannel = event => {
      sendChannel.current = event.channel
      sendChannel.current.onmessage = handleReceiveMessage
      console.log('[SUCCESS] Connection established')
    }

    /*
      Session Description: It is the config information of the peer
      SDP stands for Session Description Protocol. The exchange
      of config information between the peers happens using this protocol
    */
    const desc = new RTCSessionDescription(incoming.sdp)

    /*
      Remote Description : Information about the other peer
      Local Description: Information about you 'current peer'
    */

    peerRef.current
      .setRemoteDescription(desc)
      .then(() => { })
      .then(() => {
        return peerRef.current.createAnswer()
      })
      .then(answer => {
        return peerRef.current.setLocalDescription(answer)
      })
      .then(() => {
        const payload = {
          target: incoming.caller,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        }
        socketRef.current.emit('answer', payload)
      })
  }

  function handleAnswer(message) {
    // Handle answer by the receiving peer
    console.log('[INFO] Handling Answer, Message:', message)
    const desc = new RTCSessionDescription(message.sdp)
    peerRef.current
      .setRemoteDescription(desc)
      .catch(e => console.log('Error handle answer', e))
  }

  function handleReceiveMessage(e) {
    // Listener for receiving messages from the peer
    console.log('[INFO] Message received from peer', e.data)
    // const msg = [{
    //   _id: Math.random(1000).toString(),
    //   text: e.data,
    //   createdAt: new Date(),
    //   user: {
    //     _id: 2,
    //   },
    // }]
    // setMessages(previousMessages => GiftedChat.append(previousMessages, msg))
  }

  function handleICECandidateEvent(e) {
    /*
      ICE stands for Interactive Connectivity Establishment. Using this
      peers exchange information over the intenet. When establishing a
      connection between the peers, peers generally look for several 
      ICE candidates and then decide which to choose best among possible
      candidates
    */
    console.log('[INFO] Handling ICE Candidate Event')

    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      }
      socketRef.current.emit('ice-candidate', payload)
    }
  }

  function handleNewICECandidateMsg(incoming) {
    console.log('[INFO] Handling New ICE Candidate Msg')
    const candidate = new RTCIceCandidate(incoming)

    peerRef.current.addIceCandidate(candidate).catch(e => console.log(e))
  }

  const handleOnChange = e => {
    setMsg(e)
  }

  const handleSendMsg = () => {
    sendChannel.current.send(msg)
  }

  return (
    <View style={styles.preview}>
      <Text>JOIN FREQUENCY</Text>
      <TextInput
        placeholder="placeholder"
        onChangeText={handleOnChange}
        style={styles.input}
      />
      <TouchableOpacity
        style={[Common.button.outline, Gutters.regularBMargin]}
        onPress={handleSendMsg}
      >
        <Text style={Fonts.textRegular}>Send</Text>
      </TouchableOpacity>
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
    backgroundColor: 'gray',
  },
  container: {
    width: '100%',
    height: 300,
    backgroundColor: 'white',
  },
}

export default JoinFreq
