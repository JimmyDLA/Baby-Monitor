import { call as calling, fork, put, takeEvery } from 'redux-saga/effects'
import {
  saveNewFreq,
  saveStreams,
  SET_NAV,
  START_NEW_FREQ,
} from '../Reducers/frequency'
import { mediaDevices, RTCPeerConnection } from 'react-native-webrtc'
import { navigate } from '../Navigators/utils'
import Peer from 'react-native-peerjs'
import { io } from 'socket.io-client'
import axios from 'axios'

const URL = 'http://localhost:3000'
const DEFAULT_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: [
        "turn:eu-0.turn.peerjs.com:3478",
        "turn:us-0.turn.peerjs.com:3478",
      ],
      username: "peerjs",
      credential: "peerjsp",
    },
  ],
  sdpSemantics: "unified-plan",
}
const myPeer = new RTCPeerConnection(DEFAULT_CONFIG)
// const myPeer = new Peer(undefined, {
//   secure: false,
//   config: {
//     iceServers: [
//       {
//         urls: [
//           'stun:stun1.l.google.com:19302',
//           'stun:stun2.l.google.com:19302',
//         ],
//       },
//     ],
//   },
// })
// myPeer.on('error', e => console.log('=====> PEER:', e))

const socket = io(URL)
/**
 * The startup saga is the place to define behavior to execute when the application starts.
 */

export function* doSetNav(action) {
  try {
    // When those operations are finished we redirect to the main screen
    const {
      data: { screen },
    } = action

    navigate(screen)
  } catch (error) {
    console.warn(error)
  }
}

export function* doStartNewFreq() {
  try {
    console.log('doStartNewFreq')
    const { data } = yield calling(axios.get, URL)
    yield put(saveNewFreq(data))
    yield fork(doOpenNewPeer, {})
  } catch (error) {
    console.warn(error)
  }
}

export function* doOpenNewPeer() {
  try {

    let peerConstraints = {
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    }
    console.log('doOpenNewPeer 1')

    // async function makeCall() {

    // const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    //     const peerConnection = new RTCPeerConnection(peerConstraints);
    //     signalingChannel.addEventListener('message', async message => {
    //         if (message.answer) {
    //             const remoteDesc = new RTCSessionDescription(message.answer);
    //             await peerConnection.setRemoteDescription(remoteDesc);
    //         }
    //     });
    //     const offer = await peerConnection.createOffer();
    //     await peerConnection.setLocalDescription(offer);
    //     signalingChannel.send({'offer': offer});
    // }
    const connectToNewUser = (userId, stream) => {
      // debugger
      console.log('doOpenNewPeer 2')

      const call = myPeer.call(userId, stream)
      call.on('stream', userVideoStream => {
        saveStreams(userVideoStream)
      })
    }

    async function getMediaStream() {
      console.log('doOpenNewPeer 3')

      debugger
      let localMediaStream = null
      let isVoiceOnly = false
      let mediaConstraints = {
        audio: true,
        video: {
          frameRate: 30,
          facingMode: 'user',
        },
      }
      try {
        const mediaStream = await mediaDevices.getUserMedia(mediaConstraints)
        if (isVoiceOnly) {
          let videoTrack = await mediaStream.getVideoTracks()[0]
          videoTrack.enabled = false
        }
        console.log('doOpenNewPeer 4')

        localMediaStream = mediaStream
        myPeer.on('call', call => {
          call.answer(localMediaStream)
        })
        if (localMediaStream !== null) {
          console.log('video stream =====> ', localMediaStream.toURL())
          // setStreamUrl([localMediaStream])
          socket.on('user-connected', userId => {
            console.log('USER CONNECTED: ', userId)
            connectToNewUser(userId, localMediaStream)
          })
        }
      } catch (err) {
        // Handle Error
        console.log('getMediaStream ERROR: ', err)
      }
    }
    console.log('doOpenNewPeer 5')

    getMediaStream()
  } catch (error) {
    console.warn(error)
  }
}

export function* watchFreq() {
  yield takeEvery(SET_NAV, doSetNav)
  yield takeEvery(START_NEW_FREQ, doStartNewFreq)
}
