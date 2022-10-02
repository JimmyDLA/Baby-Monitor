import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import axios from 'axios'
import Peer from 'react-native-peerjs'
import { io } from 'socket.io-client'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme } from '@/Store/Theme'
import { RNCamera } from 'react-native-camera'
import Video from 'react-native-video'
import { mediaDevices, RTCView } from 'react-native-webrtc'

const URL = 'http://localhost:3000'
// const myPeer = new Peer(undefined)

// Home.addEventListener()
// socket.on('user-connected', userId => {
//   console.log('USER CONNECTED: ', userId)
// })

let mediaConstraints = {
  audio: true,
  video: {
    frameRate: 30,
    facingMode: 'user',
  },
}
const Home = ({ setNav, setGame }) => {
  // const socket = useRef()
  // socket.current = io(URL)
  // socket.on('user-connected', userId => {
  //   console.log('USER CONNECTED: ', userId)
  // })
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const [freq, setFreq] = useState('')
  const [joinFreq, setJoinFreq] = useState('')
  const [streamUrl, setStreamUrl] = useState(null)

  // const localPeer = new Peer(undefined, {
  //   host: '127.0.0.1',
  //   port: '3001',
  //   // path: '/',
  //   secure: false,
  // })
  // localPeer.on('error', e => console.log(e))

  // const connectToNewUser = (userId, stream) => {
  //   const call = localPeer.call(userId, stream)
  //   call.on('stream', userVideoStream => {
  //     setStreamUrl([...streamUrl, userVideoStream])
  //   })
  // }

  // async function getMediaStream() {
  //   let localMediaStream = null
  //   let isVoiceOnly = false
  //   try {
  //     const mediaStream = await mediaDevices.getUserMedia(mediaConstraints)
  //     if (isVoiceOnly) {
  //       let videoTrack = await mediaStream.getVideoTracks()[0]
  //       videoTrack.enabled = false
  //     }

  //     localMediaStream = mediaStream
  //     localPeer.on('call', call => {
  //       call.answer(localMediaStream)
  //     })
  //     if (localMediaStream !== null) {
  //       console.log('video stream =====> ', localMediaStream.toURL())
  //       setStreamUrl([localMediaStream])
  //       socket.current.on('user-connected', userId => {
  //         console.log('USER CONNECTED: ', userId)
  //         connectToNewUser(userId, localMediaStream)
  //       })
  //     }
  //   } catch (err) {
  //     // Handle Error
  //     console.log('getMediaStream ERROR: ', err)
  //   }
  // }
  useEffect(() => {
    console.log('useEffect')
    // socket.current.on('user', userId => {
    //   console.log('USER: ', userId)
    // })

    // const myPeer = new Peer(undefined, {
    //   port: 3001,
    //   host: '/',
    // })
    // localPeer.on('error', err => console.log(err))
    if (freq !== '') {
      // getMediaStream()
    }
    // socket.current.on('user-connected', userId => {
    //   console.log('USER CONNECTED: ', userId)
    // })
  }, [freq])

  const getUuid = () => {
    // console.log('axios call')
    // socket.currnet.connect()
    axios({ method: 'get', url: URL })
      .then(response => {
        setFreq(response.data)
        // localPeer.on('open', localPeerId => {
        //   socket.current.emit('join-freq', response.data, localPeerId)
        // })
      })
      .catch(err => console.log(err))
  }

  const handleCreateFreq = () => {
    setGame(true)
    // setNav({ screen: 'CreateFreq' })
  }

  const handleJoinFreq = () => {
    setNav({ screen: 'JoinFreq' })
  }

  const onJoinFreq = () => {
    // console.log(joinFreq)
    localPeer.on('open', localPeerId => {
      console.log('Local peer open with ID', localPeerId)
      socket.current.emit('join-freq', joinFreq, localPeerId)
      // const remotePeer = new Peer();
      // remotePeer.on('error', console.log);
      // remotePeer.on('open', remotePeerId => {
      //   console.log('Remote peer open with ID', remotePeerId);
      //   const conn = remotePeer.connect(localPeerId);
      //   conn.on('error', console.log);
      //   conn.on('open', () => {
      //     console.log('Remote peer has opened connection.');
      //     console.log('conn', conn);
      //     conn.on('data', data => console.log('Received from local peer', data));
      //     console.log('Remote peer sending data.');
      //     conn.send('Hello, this is the REMOTE peer!');
      //   });
    })
    // });
  }

  const handleOnChange = e => {
    // console.log(e)
    setJoinFreq(e)
  }

  return (
    <ScrollView
      style={Layout.fill}
      contentContainerStyle={[
        Layout.fill,
        Layout.colCenter,
        Gutters.smallHPadding,
      ]}
    >
      <TouchableOpacity
        style={[Common.button.outline, Gutters.regularBMargin]}
        onPress={handleCreateFreq}
      >
        <Text style={Fonts.textRegular}>Open Freq</Text>
      </TouchableOpacity>
      <Text>{freq}</Text>

      <Text>OR</Text>

      <TextInput
        placeholder="placeholder"
        onChangeText={handleOnChange}
        style={styles.input}
      />
      <TouchableOpacity
        style={[Common.button.outline, Gutters.regularBMargin]}
        onPress={handleJoinFreq}
      >
        <Text style={Fonts.textRegular}>Join Freq</Text>
      </TouchableOpacity>
      <Text>{joinFreq}</Text>
      {/* <View style={styles.container}>
        {streamUrl ? (
          streamUrl.map(stream => (
            <>
              <RTCView
                mirror={true}
                objectFit={'cover'}
                streamURL={stream.toURL()}
                zOrder={1}
                style={styles.preview}
              />
            </>
          ))
        ) : (
          <Text>no video stream</Text>
        )}
      </View> */}
    </ScrollView>
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
    // width: '100%',
    // height: 300,
  },
  container: {
    // flex: 1,
    // flexDirection: 'column',
    width: '100%',
    height: 300,
    backgroundColor: 'white',
  },
}

export default Home
// const mapStateToProps = (state) => ({})

// const mapDispatchToProps = {
//   setGame,
// }

// export default connect(mapStateToProps, mapDispatchToProps, null, {
//   forwardRef: true,
// })(Home)
