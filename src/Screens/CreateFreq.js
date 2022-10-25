import React, { useEffect, useRef, useState } from 'react'
import { View, Text } from 'react-native'
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc'
import io from 'socket.io-client'
import 'react-native-get-random-values'
import { v4 as uuidV4 } from 'uuid'

const URL = 'http://192.168.86.87:3000'
const room = uuidV4()
const mediaConstraints = {
  audio: true,
  video: {
    frameRate: 30,
    facingMode: 'user',
  },
}

const CreateFreq = ({ startNewFrequency }) => {
  const peerRef = useRef()
  const socketRef = useRef()
  const otherUser = useRef()
  const sendChannel = useRef() // Data channel

  const [serverMsg, setServerMsg] = useState('')
  const [localMediaStream, setLocalMediaStream] = useState(null)

  useEffect(() => {
    console.log('create freq OnMount useEffect - room:', room)
    socketRef.current = io.connect(URL)
    startNewFrequency()
    handleGetMedia()

    socketRef.current.emit('join-freq', room) // Room ID

    socketRef.current.on('other-user', userID => {
      console.log('other-user: ', userID)
      callUser(userID)
      otherUser.current = userID
      peerRef.current.addStream(localMediaStream)
    })
    // Signals that both peers have joined the room
    socketRef.current.on('user-joined', userID => {
      otherUser.current = userID
    })

    socketRef.current.on('offer', handleOffer)

    socketRef.current.on('answer', handleAnswer)

    socketRef.current.on('ice-candidate', handleNewICECandidateMsg)
  }, [])

  // useEffect(() => {
  //   if (localMediaStream !== null) {
  //     console.log('local media steam updated useEffet', localMediaStream)
  //     peerRef.current.addStream(localMediaStream)
  //   }
  // }, [localMediaStream])

  const handleGetMedia = async () => {
    let isVoiceOnly = false

    try {
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints)

      if (isVoiceOnly) {
        let videoTrack = await mediaStream.getVideoTracks()[0]
        videoTrack.enabled = false
      }

      setLocalMediaStream(mediaStream)
    } catch (err) {
      // Handle Error
      console.log({ err })
    }
  }

  function callUser(userID) {
    // This will initiate the call for the receiving peer
    console.log('[INFO] createFreq Initiated a call')
    peerRef.current = Peer(userID)
    sendChannel.current = peerRef.current.createDataChannel('sendChannel')

    // listen to incoming messages from other peer
    sendChannel.current.onmessage = handleReceiveMessage
  }

  function Peer(userID) {
    /*
      Here we are using Turn and Stun server
      (ref: https://blog.ivrpowers.com/post/technologies/what-is-stun-turn-server/)
    */

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    peer.onicecandidate = handleICECandidateEvent
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID)
    return peer
  }

  function handleNegotiationNeededEvent(userID) {
    // Offer made by the initiating peer to the receiving peer.
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
    console.log('[INFO] createFreq Handling Offer')
    peerRef.current = Peer()
    peerRef.current.ondatachannel = event => {
      sendChannel.current = event.channel
      sendChannel.current.onmessage = handleReceiveMessage
      console.log('[SUCCESS] Connection established')
      // sendChannel.current.send(localMediaStream)
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
    console.log('[INFO] createFreq Handling Answer, Message:', message)
    const desc = new RTCSessionDescription(message.sdp)
    peerRef.current
      .setRemoteDescription(desc)
      .catch(e => console.log('Error handle answer', e))
  }

  function handleReceiveMessage(e) {
    // Listener for receiving messages from the peer
    console.log('[INFO] createFreq Message received from peer', e.data)
    setServerMsg(e.data)
  }

  function handleICECandidateEvent(e) {
    console.log('[INFO] createFreq Handling ICE Candidate Event')

    /*
      ICE stands for Interactive Connectivity Establishment. Using this
      peers exchange information over the intenet. When establishing a
      connection between the peers, peers generally look for several
      ICE candidates and then decide which to choose best among possible
      candidates
    */
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      }
      socketRef.current.emit('ice-candidate', payload)
    }
  }

  function handleNewICECandidateMsg(incoming) {
    console.log('[INFO] createFreq Handling New ICE Candidate Msg')

    const candidate = new RTCIceCandidate(incoming)

    peerRef.current.addIceCandidate(candidate).catch(e => console.log(e))
  }

  return (
    <View style={styles.preview}>
      <Text>CREATE FREQUENCY</Text>
      <Text>Incoming: {serverMsg}</Text>
      {localMediaStream && (
        <View style={styles.rtcContainer}>
          <RTCView
            style={styles.rtcView}
            mirror={true}
            objectFit={'cover'}
            streamURL={localMediaStream.toURL()}
            zOrder={1}
          />
        </View>
      )}
    </View>
  )
}

const styles = {
  rtcContainer: {
    width: '100%',
    height: 300,
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'pink',
  },
  rtcView: { width: '100%', height: '100%' },
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
