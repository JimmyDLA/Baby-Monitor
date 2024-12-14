import React, { useEffect, useRef, useState } from 'react'
import { Alert, View, Text } from 'react-native'
import crashlytics from '@react-native-firebase/crashlytics'
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc'
import Config from 'react-native-config'
import InCallManager from 'react-native-incall-manager'
import io from 'socket.io-client'
import 'react-native-get-random-values'
import { v4 as uuidV4 } from 'uuid'
import QRCode from 'react-native-qrcode-svg'
import { useNavigation } from '@react-navigation/native'
import { Button, ScreenContainer } from '../Components'
import { Font, FontFam, Color } from '@/Theme/Theme'

const URL = Config.SERVER
console.warn('SERVER @ ', URL)

const mediaConstraints = {
  // don't know if noise suppression actually work as is
  noiseSuppression: false,
  audio: true,
  video: {
    frameRate: 30,
    facingMode: 'user',
  },
}
const room = uuidV4()

const CreateFreq = ({ setNav, startNewFrequency }) => {
  const peerRef = useRef()
  const socketRef = useRef()
  const otherUser = useRef()
  const sendChannel = useRef() // Data channel
  const localMediaRef = useRef()
  const isVoiceOnly = useRef(false)

  const [serverMsg, setServerMsg] = useState('')
  const [localMediaStream, setLocalMediaStream] = useState(null)
  const [isRoomReady, setIsRoomReady] = useState(false)

  const navigation = useNavigation()
  const baby = 'baby'
  let hasEnded = false

  useEffect(() => {
    navigation.addListener('beforeRemove', e => {
      console.log({ hasEnded })
      if (hasEnded) {
        // If we don't have unsaved changes, then we don't need to do anything
        return
      }
      // Prevent default behavior of leaving the screen
      e.preventDefault()
      // Prompt the user before leaving the screen
      Alert.alert('Exit?', 'Are you sure you want to leave this screen?', [
        { text: "Don't leave", style: 'cancel', onPress: () => { } },
        {
          text: 'Leave',
          style: 'destructive',
          // If the user confirmed, then we dispatch the action we blocked earlier
          // This will continue the action that had triggered the removal of the screen
          onPress: () => {
            socketRef.current.emit('end', room)
            navigation.dispatch(e.data.action)
          },
        },
      ])
    })

    socketRef.current = io.connect(URL)
    console.log({ socketRef })

    socketRef.current.emit('join-freq', { baby, room }) // Room ID

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
    socketRef.current.on('end', handleEnd)
    socketRef.current.on('offer', handleOffer)
    socketRef.current.on('answer', handleAnswer)
    socketRef.current.on('switch-camera', handleSwitch)
    socketRef.current.on('toggle-audio', handleOnAndOffCamera)
    socketRef.current.on('ice-candidate', handleNewICECandidateMsg)
    socketRef.current.on('confirm-room', handleConfirmation)

    return () => {
      console.log('[INFO] createFreq cleanup ')
      socketRef.current.disconnect()
    }
  }, [])

  const getMedia = async () => {
    let voiceOnly = false

    try {
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints)

      if (voiceOnly) {
        let videoTrack = await mediaStream.getVideoTracks()[0]
        videoTrack.enabled = false
      }
      InCallManager.setSpeakerphoneOn(true)
      InCallManager.setKeepScreenOn(true)

      return mediaStream
    } catch (err) {
      // Handle Error
      console.log({ err })
      crashlytics().log(`${JSON.stringify(err)}`)
    }
  }

  // function callUser(userID) {
  //   // This will initiate the call for the receiving peer
  //   console.log('[INFO] createFreq Initiated a call')
  //   peerRef.current = Peer(userID)
  //   sendChannel.current = peerRef.current.createDataChannel('sendChannel')

  //   // listen to incoming messages from other peer
  //   sendChannel.current.onmessage = handleReceiveMessage
  // }

  function Peer(userID) {
    console.log('[INFO] createFreq Peer')
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
    // peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID)
    peer.onsignalingstatechange = event => {
      console.log('[STAT] createFreq signal', peerRef.current.signalingState)
    }
    peer.ondatachannel = async event => {
      sendChannel.current = event.channel
      sendChannel.current.onmessage = handleReceiveMessage
      console.log('[SUCCESS] createFreq Connection established')
    }

    peer.onconnectionstatechange = event => {
      console.log(
        '[STAT] createFreq connection changed: ',
        peerRef.current.connectionState,
      )
    }

    peer.oniceconnectionstatechange = event => {
      console.log(
        '[STAT] createFreq ice connection changed : ',
        peerRef.current.iceConnectionState,
      )
    }
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

    // eslint-disable-next-line prettier/prettier
    peerRef.current.createOffer(sessionConstraints)
      .then(offer => {
        return peerRef.current.setLocalDescription(offer)
      })
      .then(() => {
        const payload = {
          target: otherUser.current,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        }
        console.log('[INFO] createFreq handleNegotiationNeededEvent')
        socketRef.current.emit('offer', payload)
      })
      .catch(err => {
        crashlytics().log(`${JSON.stringify(err)}`)
        console.log('Error handling negotiation needed event', err)
      })
  }

  async function handleOffer(incoming) {
    // ====================== 14. Handle offer ======================
    /*
      Here we are exchanging config information
      between the peers to establish communication
    */

    let sessionConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        VoiceActivityDetection: true,
      },
    }

    peerRef.current = Peer()
    localMediaRef.current = await getMedia()
    setLocalMediaStream(localMediaRef.current)

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

    // eslint-disable-next-line prettier/prettier
    peerRef.current.setRemoteDescription(desc)
      .then(() => {
        peerRef.current.addStream(localMediaRef.current)
      })
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
        // ====================== 16. Emit answer payload to server ======================
        socketRef.current.emit('answer', payload)
      })
      .catch(e => {
        crashlytics().log(`${JSON.stringify(e)}`)
        console.log('[ERROR] ', e)
      })
  }

  function handleAnswer(message) {
    // Handle answer by the receiving peer
    console.log('[INFO] createFreq Handling Answer', message)
    const desc = new RTCSessionDescription(message.sdp)
    peerRef.current.setRemoteDescription(desc).catch(e => {
      crashlytics().log(`${JSON.stringify(e)}`)
      console.log('Error handle answer', e)
    })
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
    console.log('[INFO] createFreq handleTrackEvnet', e)
  }

  function handleEnd() {
    hasEnded = true
    console.log('[INFO] createFreq End')
    localMediaRef.current.getTracks().map(track => track.stop())
    setLocalMediaStream(null)
    peerRef.current._unregisterEvents()
    peerRef.current.close()
    peerRef.current = null
    socketRef.current.disconnect()
    setNav({ screen: 'Home' })
  }

  const handleExit = () => {
    setNav({ screen: 'Home' })
  }

  async function handleSwitch() {
    console.log('[INFO] createFreq handleSwitch')
    let cameraCount = 0

    try {
      const devices = await mediaDevices.enumerateDevices()

      devices.map(device => {
        if (device.kind !== 'videoinput') {
          return
        }

        cameraCount = cameraCount + 1
      })
    } catch (err) {
      // Handle Error
      console.log('[ERR] createFreq handleSwitch error')
      crashlytics().log('handleSwitch - create freq')
    }
    console.log('[INFO] createFreq', { cameraCount })

    if (cameraCount > 1) {
      let videoTrack = await localMediaRef.current.getVideoTracks()[0]
      videoTrack._switchCamera()
    }
  }

  async function handleOnAndOffCamera() {
    console.log('[INFO] createFreq handleOnAndOffCamera', !isVoiceOnly.current)
    let videoTrack = await localMediaRef.current.getVideoTracks()[0]
    videoTrack.enabled = isVoiceOnly.current
    isVoiceOnly.current = !isVoiceOnly.current
    // setIsVoiceOnly(!isVoiceOnl.cuy)
  }

  function handleNewICECandidateMsg(incoming) {
    console.log('[INFO] createFreq handleNewICECandidateMsg')

    const candidate = new RTCIceCandidate(incoming)

    peerRef.current.addIceCandidate(candidate).catch(e => console.log(e))
  }

  const handleConfirmation = e => {
    setIsRoomReady(e)
  }

  return (
    <ScreenContainer>
      <View style={styles.preview}>
        {isRoomReady ? (
          <>
            <Text style={styles.text}>Scan QR code to join room</Text>
            <QRCode size={200} value={room} />
            {localMediaStream && <Text style={styles.live}>LIVE</Text>}
            <Text style={styles.text}>OR</Text>
            <Text style={styles.text}>Type room ID to join:</Text>
            <Text style={styles.text}>{room}</Text>
            <Button secondary text="Exit" onPress={handleExit} />
          </>
        ) : (
          <Text style={styles.text}>Connecting to server...</Text>
        )}
      </View>
    </ScreenContainer>
  )
}

const styles = {
  preview: {
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '100%',
  },
  text: {
    fontSize: Font.regular,
    fontFamily: FontFam.kaisei,
    color: Color.black,
  },
  buttonText: {
    color: 'white',
  },
  live: {
    color: 'red',
  },
}

export default CreateFreq
