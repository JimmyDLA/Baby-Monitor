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

const URL = 'http://192.168.86.89:3000'
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
    // getMedia()

    socketRef.current.emit('join-freq', room) // Room ID

    socketRef.current.on('other-user', userID => {
      console.log('[INFO] createFreq other-user: ', userID)
      // callUser(userID)
      otherUser.current = userID
      // peerRef.current.addStream(localMediaStream)
    })
    // Signals that both peers have joined the room
    socketRef.current.on('user-joined', userID => {
      console.log('[INFO] createFreq user-joined: ', userID)
      otherUser.current = userID
      // callUser(userID)
    })
    // ====================== 13. Add listener for icoming offers ======================
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

  const getMedia = async () => {
    let isVoiceOnly = false

    try {
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints)

      if (isVoiceOnly) {
        let videoTrack = await mediaStream.getVideoTracks()[0]
        videoTrack.enabled = false
      }

      setLocalMediaStream(mediaStream)
      return mediaStream
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
    // =========== 21. Add listener on ice candidate once done setting all descps ============
    peer.onicecandidate = handleICECandidateEvent
    peer.ontrack = handleTrackEvnet
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID)
    return peer
  }

  function handleNegotiationNeededEvent(userID) {
    // console.log('[INFO] createFreq handleNegotiationNeededEvent')
    // Offer made by the initiating peer to the receiving peer.
    let sessionConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        VoiceActivityDetection: true,
      },
    }

    peerRef.current
      .createOffer(sessionConstraints)
      .then(offer => {
        return peerRef.current.setLocalDescription(offer)
      })
      .then(() => {
        const payload = {
          target: otherUser.current,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        }
        console.log('[INFO] createFreq handleNegotiationNeededEvent', { payload })
        socketRef.current.emit('offer', payload)
      })
      .catch(err => console.log('Error handling negotiation needed event', err))
  }

  async function sendVideo() {
    console.log({ localMediaStream })
    const newMedia = await getMedia()
    console.log('========================> ', peerRef.current.addStream)

    peerRef.current.addStream(newMedia)
  }

  async function handleOffer(incoming) {
    /*
      Here we are exchanging config information
      between the peers to establish communication
    */

    // ====================== 14. Handle offer ======================

    let sessionConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        VoiceActivityDetection: true,
      },
    }
    const media = await getMedia()

    peerRef.current = Peer()
    peerRef.current.onsignalingstatechange = event => {
      console.log('[STAT] createFreq signal', peerRef.current.signalingState)
    }
    peerRef.current.ondatachannel = event => {
      sendChannel.current = event.channel
      sendChannel.current.onmessage = handleReceiveMessage
      console.log('[SUCCESS] createFreq Connection established', media.toURL())

      peerRef.current.addStream(media)
      // sendVideo()
      // sendChannel.current.send(localMediaStream)
    }


    // peerRef.current.onaddstream = event => {
    //   console.log('=====================================================> EVENT!', event)
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
    // ====================== 15. Answer, save remote & local descp ======================

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
        console.log('[INFO] createFreq handleOffer')
        const payload = {
          target: incoming.caller,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        }
        // ====================== 16. Emit answer payload to server ======================
        socketRef.current.emit('answer', payload)
      })
      .catch(e => console.log('[ERROR] ', e))
  }

  function handleAnswer(message) {
    // Handle answer by the receiving peer
    console.log('[INFO] createFreq Handling Answer', message)
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
    console.log('[INFO] createFreq handleICECandidateEvent')

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
        origin: socketRef.current.id,
      }
      // =========== 22. Emit to server ice candidate ============
      socketRef.current.emit('ice-candidate', payload)
    }
  }

  function handleTrackEvnet(e) {
    console.log('[INFO] createFreq Track received from peer', e)
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
    backgroundColor: 'white',
  },
  container: {
    width: '100%',
    height: 300,
    backgroundColor: 'white',
  },
}

export default CreateFreq
