import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc'
import Config from 'react-native-config'
import InCallManager from 'react-native-incall-manager'
import { StatusBar, View, Text, Animated, Alert } from 'react-native'
import cameraOffIcon from '../../assets/images/Camera_off_icon.png'
import cameraOnIcon from '../../assets/images/Camera_on_icon.png'
import endIcon from '../../assets/images/End_call_icon.png'
import switchCam from '../../assets/images/Switch_cam_icon.png'
import { Font, FontFam, Color, Size } from '@/Theme/Theme'
import { Button, ScreenContainer } from '../Components'

const URL = Config.SERVER

const mediaConstraints = {
  audio: true,
  video: {
    frameRate: 30,
    facingMode: 'user',
  },
}
const VolumeMeter = props => {
  const meterAnimated = useRef(new Animated.Value(0)).current // Initial value for opacity: 0

  useEffect(() => {
    Animated.timing(meterAnimated, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start()
  }, [meterAnimated])

  return (
    <Animated.View // Special animatable View
      style={{
        ...props.style,
        transform: [
          {
            scale: meterAnimated.interpolate({
              inputRange: [0, 1],
              outputRange: [0, props.volume], // 0 : 150, 0.5 : 75, 1 : 0
            }),
          },
        ],
      }}
    >
      {props.children}
    </Animated.View>
  )
}

const JoinFreq = ({ room, setNav, saveNewFreq }) => {
  // console.log('[INFO] JoinFreq room:', room)
  const peerRef = useRef()
  const socketRef = useRef()
  const otherUser = useRef()
  const sendChannel = useRef() // Data channel
  const audioInterval = useRef()
  const localMediaRef = useRef()
  const remoteMediaRef = useRef()

  const [remoteMediaStream, setRemoteMediaStream] = useState(null)
  const [isDisconnect, setIsDisconnect] = useState(false)
  const [isVoiceOnly, setIsVoiceOnly] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const parent = 'parent'
  const camIcon = isVoiceOnly ? cameraOnIcon : cameraOffIcon

  useEffect(() => {
    // console.log('[INFO] JoinFreq useEffect', room)
    socketRef.current = io.connect(URL)
    // console.log('[INFO] JoinFreq sockeet', socketRef.current)
    setTimeout(() => {
      // console.log('TIMEDOUT: checking remote stream, ', remoteMediaStream)
      if (!remoteMediaRef.current && !peerRef.current) {
        Alert.alert(
          'Connection Timed-out',
          'Can not connect to baby room. Please try again.',
          [
            {
              text: 'OK',
              onPress: () => setNav({ screen: 'Home' }),
            },
            {
              text: 'Cancel',
              onPress: () => { },
            },
          ],
        )
      }
    }, 10000)
    // ====================== 1. Emit joining roomID to server ======================

    socketRef.current.emit('join-freq', { parent, room })

    // ====================== 4. Add Listener for server if there is another user in room ======================
    socketRef.current.on('other-user', userID => {
      // console.log('[INFO] JoinFreq other-user', { userID })
      // ====================== 5. Call this other user with userID ======================
      callUser(userID)
      otherUser.current = userID
    })
    // Signals that both peers have joined the room
    socketRef.current.on('user-joined', userID => {
      // console.log('[INFO] JoinFreq user-joined', { userID })

      otherUser.current = userID
    })

    socketRef.current.on('offer', handleOffer)

    // ====================== 19. Add Listener for incoming answer ======================
    socketRef.current.on('answer', handleAnswer)
    // ====================== 25. Add Listener for incoming ice-candidate ======================
    socketRef.current.on('ice-candidate', handleNewICECandidateMsg)

    socketRef.current.on('end', handleEnd)

    return () => {
      // console.log('[INFO] JoinFreq cleanup ')
    }
  }, [])

  function callUser(userID) {
    // ====================== 6. Initiated a call with Peer() & add peerRef ======================
    // console.log('[INFO] JoinFreq Initiated a call')
    peerRef.current = Peer(userID)
    localMediaRef.current = getMedia()
    // sendChannel.current = peerRef.current.createDataChannel('sendChannel')

    // listen to incoming messages from other peer
    // sendChannel.current.onmessage = handleReceiveMessage
  }

  const getMedia = async () => {
    let voiceOnly = true

    try {
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints)
      const audioTrack = await mediaStream.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled

      if (voiceOnly) {
        let videoTrack = await mediaStream.getVideoTracks()[0]
        videoTrack.enabled = false
      }

      peerRef.current.addStream(mediaStream)
      InCallManager.setForceSpeakerphoneOn(true)
      return mediaStream
    } catch (err) {
      // Handle Error
      // console.log({ err })
    }
  }

  function Peer(userID) {
    // console.log('[INFO] JoinFreq Peer')
    /*
      Here we are using Turn and Stun server
      (ref: https://blog.ivrpowers.com/post/technologies/what-is-stun-turn-server/)
    */
    // ====================== 7. Start RTCPeerConnection  ======================
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    peer.ontrack = handleTrackEvnet
    // ====================== 8. Add Listener for hand shake to handle Negotiation need  ======================
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID)
    peer.onaddstream = event => handleAddStream(event)
    peer.onsignalingstatechange = event => {
      console.log('[STAT] JoinFreq signal', peerRef.current.signalingState)
    }
    peer.ondatachannel = async event => {
      sendChannel.current = event.channel
      sendChannel.current.onmessage = handleReceiveMessage
      // console.log('[SUCCESS] JoinFreq Connection established')
    }

    peer.onconnectionstatechange = event => {
      console.log(
        '[STAT] JoinFreq connection changed: ',
        peerRef.current.connectionState,
      )
      if (peerRef.current.connectionState === 'disconnected') {
        setIsDisconnect(true)
      }

      if (peerRef.current.connectionState === 'failed') {
        Alert.alert(
          'Connection Failed',
          "Please check baby's room device and verify it's connect to the internet.",
          [
            {
              text: 'OK',
              onPress: () => setNav({ screen: 'Home' }),
            },
          ],
        )
      }
    }

    peer.oniceconnectionstatechange = event => {
      console.log(
        '[STAT] JoinFreq ice connection changed : ',
        peerRef.current.iceConnectionState,
      )
    }
    return peer
  }

  async function handleAddStream(event) {
    // console.log('[INFO] JoinFreq onaddstream', { event })
    remoteMediaRef.current = event.stream
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
        // console.log('[INFO] JoinFreq handleNegotiationNeededEvent')
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
    // console.log('[INFO] JoinFreq Handling Offer')
    peerRef.current = Peer()
    peerRef.current.ondatachannel = event => {
      sendChannel.current = event.channel
      sendChannel.current.onmessage = handleReceiveMessage
      // console.log('[SUCCESS] JoinFreq Connection established')
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
        // console.log('[INFO] JoinFreq handleOffer answer,')

        const payload = {
          target: incoming.caller,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        }

        socketRef.current.emit('answer', payload)
      })
  }

  function handleAnswer(message) {
    // =========== 20. Set remote descp and possibly emitting ice candidate event ============

    // Handle answer by the receiving peer
    // console.log('[INFO] JoinFreq handleAnswer.')
    const desc = new RTCSessionDescription(message.sdp)

    // eslint-disable-next-line prettier/prettier
    peerRef.current.setRemoteDescription(desc)
      .catch(e => console.log('Error handle answer', e))
  }

  function handleReceiveMessage(e) {
    // Listener for receiving messages from the peer
    // console.log('[INFO] JoinFreq Message received from peer', e.data)
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
    // console.log('[INFO] JoinFreq Handling ICE Candidate Event')

    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      }
      socketRef.current.emit('ice-candidate', payload)
    }
  }

  function handleEnd() {
    saveNewFreq('')
    // console.log('[INFO] JoinFreq end')
    clearAudioInterval()
    setRemoteMediaStream(null)
    peerRef.current._unregisterEvents()
    peerRef.current.close()
    peerRef.current = null
    socketRef.current.disconnect()
    setNav({ screen: 'Home' })
  }

  function emitEnd() {
    socketRef.current.emit('end', room)
    handleEnd()
  }

  function handleNewICECandidateMsg(incoming) {
    // =========== 26. create & set ice candidate to peer  ============
    // console.log('[INFO] JoinFreq handleNewICECandidateMsg', incoming)
    const candidate = new RTCIceCandidate(incoming.candidate)

    peerRef.current
      .addIceCandidate(candidate)
      .catch(e => console.log('[ERR] JoinFreq handleNewICECandidateMsg', e))
  }

  function handleTrackEvnet(e) {
    // console.log('[INFO] JoinFreq Track received from peer', e)
  }

  const emitSwitchCamera = () => {
    socketRef.current.emit('switch-camera')
  }

  const setAudioInterval = () => {
    // console.log('[INFO] JoinFreq setAudioInterval')
    audioInterval.current = setInterval(async () => {
      const stats = await peerRef.current.getStats()
      for (let value of stats) {
        if (value[1].audioLevel) {
          // console.log('[INFO] JoinFreq Stats value', value[1].audioLevel)
          setVolumeLevel(value[1].audioLevel * 5)
        }
      }
    }, 100)
  }

  const clearAudioInterval = () => {
    // console.log('[INFO] JoinFreq clearAudioInterval')
    clearInterval(audioInterval.current)
  }

  const emitToggleAudio = () => {
    // console.log('[INFO] JoinFreq emitToggleAudio isVoiceOnly: ', isVoiceOnly)
    setIsVoiceOnly(!isVoiceOnly)
    socketRef.current.emit('toggle-audio')
    // console.log('[INFO] JoinFreq SET isVoiceOnly: ', isVoiceOnly)

    if (!isVoiceOnly) {
      // console.log('[INFO] JoinFreq isVoiceOnly')
      setAudioInterval()
    } else {
      // console.log('[INFO] JoinFreq isVoiceOnly else')
      clearAudioInterval()
    }
  }

  return remoteMediaStream ? (
    <View style={styles.rtcContainer}>
      <StatusBar barStyle={'dark-content'} />
      {isDisconnect && (
        <View style={styles.disconnectCont}>
          <Text style={styles.disconnectText}>Connection Disconnected.</Text>
          <Text style={styles.disconnectText}>
            Please wait, reconnecting...
          </Text>
        </View>
      )}
      {!isVoiceOnly ? (
        <RTCView
          style={styles.rtcView}
          mirror={true}
          objectFit={'cover'}
          streamURL={remoteMediaStream.toURL()}
          zOrder={1}
        />
      ) : (
        <VolumeMeter volume={volumeLevel} style={styles.volumeMeter} />
      )}
      <View style={styles.buttonCont}>
        <Button primary icon={switchCam} onPress={emitSwitchCamera} />
        <Button secondary icon={endIcon} onPress={emitEnd} />
        <Button primary icon={camIcon} onPress={emitToggleAudio} />
      </View>
    </View>
  ) : (
    <ScreenContainer>
      <StatusBar barStyle={'dark-content'} />
      <View style={styles.preview}>
        <Text style={styles.connecting}>CONNECTING...</Text>
      </View>
    </ScreenContainer>
  )
}

const styles = {
  rtcContainer: {
    width: Size.full,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.background,
  },
  rtcView: { width: Size.full, height: Size.full },
  preview: {
    height: Size.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCont: {
    position: 'absolute',
    zIndex: 1,
    bottom: 40,
    width: Size.full,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  connecting: {
    fontFamily: FontFam.kaisei,
    fontSize: Font.regular,
    color: Color.black,
  },
  volumeMeter: {
    width: Size.large,
    height: Size.large,
    backgroundColor: Color.darkGreen,
    borderRadius: Size.xxxlarge,
  },
  disconnectCont: {
    position: 'absolute',
    top: 100,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: Size.large,
    borderRadius: Size.large,
  },
  disconnectText: {
    color: Color.secondary,
    fontFamily: FontFam.kaisei,
    fontSize: Font.regular,
  },
}

export default JoinFreq
