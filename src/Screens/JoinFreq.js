import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useTheme } from '@/Hooks'

const URL = 'http://192.168.86.89:3000'

const mediaConstraints = {
  audio: true,
  video: {
    frameRate: 30,
    facingMode: 'user',
  },
}

const JoinFreq = ({ room }) => {
  const { Common, Fonts, Gutters } = useTheme()

  console.log(room)
  const peerRef = useRef()
  const socketRef = useRef()
  const otherUser = useRef()
  const sendChannel = useRef() // Data channel

  const [remoteMediaStream, setRemoteMediaStream] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    console.log('JoinFreq useEffect')
    socketRef.current = io.connect(URL)
    // ====================== 1. Emit joining roomID to server ======================
    socketRef.current.emit('join-freq', room)

    // ====================== 4. Add Listener for server if there is another user in room ======================
    socketRef.current.on('other-user', userID => {
      console.log('[INFO] JoinFreq other-user', { userID })
      // ====================== 5. Call this other user with userID ======================
      callUser(userID)
      otherUser.current = userID
    })
    // Signals that both peers have joined the room
    socketRef.current.on('user-joined', userID => {
      console.log('[INFO] JoinFreq user-joined', { userID })

      otherUser.current = userID
    })

    socketRef.current.on('offer', handleOffer)

    // ====================== 19. Add Listener for incoming answer ======================
    socketRef.current.on('answer', handleAnswer)
    // ====================== 25. Add Listener for incoming ice-candidate ======================
    socketRef.current.on('ice-candidate', handleNewICECandidateMsg)
  }, [])

  function callUser(userID) {
    // ====================== 6. Initiated a call with Peer() & add peerRef ======================
    console.log('[INFO] JoinFreq Initiated a call')
    peerRef.current = Peer(userID)
    getMedia()
    // sendChannel.current = peerRef.current.createDataChannel('sendChannel')

    // listen to incoming messages from other peer
    // sendChannel.current.onmessage = handleReceiveMessage
  }

  const getMedia = async () => {
    let isVoiceOnly = false

    try {
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints)

      if (isVoiceOnly) {
        let videoTrack = await mediaStream.getVideoTracks()[0]
        videoTrack.enabled = false
      }

      peerRef.current.addStream(mediaStream)
      return mediaStream
    } catch (err) {
      // Handle Error
      console.log({ err })
    }
  }


  function Peer(userID) {
    console.log('[INFO] JoinFreq Peer')
    /*
      Here we are using Turn and Stun server
      (ref: https://blog.ivrpowers.com/post/technologies/what-is-stun-turn-server/)
    */
    // ====================== 7. Start RTCPeerConnection  ======================
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    // peer.onicecandidate = handleICECandidateEvent
    // peer.onaddstream = event => {
    //   console.log('[INFO] JoinFreq onaddstream')
    //   setRemoteMediaStream(event.stream)
    // }
    peer.ontrack = handleTrackEvnet
    // ====================== 8. Add Listener for hand shake to handle Negotiation need  ======================
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID)
    peer.onaddstream = event => handleAddStream(event)
    return peer
  }

  function handleAddStream(event) {
    console.log('[INFO] JoinFreq onaddstream', { event })
    setRemoteMediaStream(event.stream)
  }

  function handleNegotiationNeededEvent(userID) {
    // Offer made by the initiating peer to the receiving peer.
    let sessionConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        VoiceActivityDetection: true,
      },
    }
    // ====================== 9. Create offer & setLocalDescription with offer ======================
    // eslint-disable-next-line prettier/prettier
    peerRef.current.createOffer(sessionConstraints)
      .then(offer => {
        return peerRef.current.setLocalDescription(offer)
      })
      .then(() => {
        console.log('[INFO] JoinFreq handleNegotiationNeededEvent')
        const payload = {
          target: userID,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        }
        // ====================== 10. Emit offer to Server ======================
        socketRef.current.emit('offer', payload)
      })
      .catch(err => console.log('Error handling negotiation needed event', err))
  }

  function handleOffer(incoming) {
    /*
      Here we are exchanging config information
      between the peers to establish communication
    */
    console.log('[INFO] JoinFreq Handling Offer')
    peerRef.current = Peer()
    peerRef.current.ondatachannel = event => {
      sendChannel.current = event.channel
      sendChannel.current.onmessage = handleReceiveMessage
      console.log('[SUCCESS] JoinFreq Connection established')
    }
    // peerRef.current.onaddstream = event => {
    //   console.log('=================================================================================================> EVENT!', event)
    // }

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
        console.log('[INFO] JoinFreq handleOffer answer,')

        const payload = {
          target: incoming.caller,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        }
        // peerRef.current.addEventListener('addstream', event => {
        //   // Grab the remote stream from the connected participant.
        //   console.log('=================================================================================================> EVENT!',)
        //   setRemoteMediaStream(event.stream)
        // })
        socketRef.current.emit('answer', payload)
      })
  }

  function handleAnswer(message) {
    // =========== 20. Set remote descp and possibly emitting ice candidate event ============

    // Handle answer by the receiving peer
    console.log('[INFO] JoinFreq handleAnswer.')
    const desc = new RTCSessionDescription(message.sdp)
    // peerRef.current.addEventListener('addstream', e => {
    //   setRemoteMediaStream(e.stream)
    // })

    // eslint-disable-next-line prettier/prettier
    peerRef.current.setRemoteDescription(desc)
      .catch(e => console.log('Error handle answer', e))
  }

  function handleReceiveMessage(e) {
    // Listener for receiving messages from the peer
    console.log('[INFO] JoinFreq Message received from peer', e.data)
    // setRemoteMediaStream(e.data)
  }

  function handleICECandidateEvent(e) {
    /*
      ICE stands for Interactive Connectivity Establishment. Using this
      peers exchange information over the intenet. When establishing a
      connection between the peers, peers generally look for several 
      ICE candidates and then decide which to choose best among possible
      candidates
    */
    console.log('[INFO] JoinFreq Handling ICE Candidate Event')

    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      }
      socketRef.current.emit('ice-candidate', payload)
    }
  }

  function handleNewICECandidateMsg(incoming) {
    // =========== 26. create & set ice candidate to peer  ============
    console.log('[INFO] JoinFreq handleNewICECandidateMsg', incoming)
    const candidate = new RTCIceCandidate(incoming.candidate)

    peerRef.current.addIceCandidate(candidate).catch(e => console.log(e))
  }

  function handleTrackEvnet(e) {
    console.log('[INFO] JoinFreq Track received from peer', e)
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
      {remoteMediaStream && (
        <View style={styles.rtcContainer}>
          <RTCView
            style={styles.rtcView}
            mirror={true}
            objectFit={'cover'}
            streamURL={remoteMediaStream.toURL()}
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
    // flex: 1,
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
    backgroundColor: 'gray',
  },
  container: {
    width: '100%',
    height: 300,
    backgroundColor: 'white',
  },
}

export default JoinFreq
