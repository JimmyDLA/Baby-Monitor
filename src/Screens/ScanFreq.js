import React, { useState, useEffect } from 'react'
import { Text, View, StatusBar, TouchableOpacity } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { Button } from '../Components'
import { Font, FontFam, Color, Size } from '@/Theme/Theme'

const PendingView = ({ status, handleClose }) => {
  const authorize =
    status === 'PENDING_AUTHORIZATION'
      ? 'Waiting...'
      : 'Go to Settings > Privacy & Security > Camera'
  return (
    <View style={styles.waiting}>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>
      <Text>Permission to use camera</Text>
      <Text>{authorize}</Text>
    </View>
  )
}

const ScanFreq = ({ setNav, setGame, saveNewFreq, room }) => {
  const [QRCodeRead, setQRCodeRead] = useState(false)

  useEffect(() => {
    return () => {
      console.log('[INFO] ScanFreq cleanup ')
    }
  }, [QRCodeRead])

  const handleClose = () => {
    setNav({ screen: 'Home' })
  }

  const handleQRCode = e => {
    if (!QRCodeRead) {
      console.log('[INFO] ScanFreq', e.data)
      setQRCodeRead(true)
      saveNewFreq(e.data)
      setNav({ screen: 'JoinFreq' })
    }
  }

  const handleCamToggle = () => {
    setNav({ screen: 'TypeFreq' })
  }

  const handleJoinRecent = () => {
    if (room) {
      saveNewFreq(room)
      setNav({ screen: 'JoinFreq' })
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      <RNCamera
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.off}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        onBarCodeRead={handleQRCode}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        androidRecordAudioPermissionOptions={{
          title: 'Permission to use audio recording',
          message: 'We need your permission to use your audio',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
      >
        {({ status }) =>
          status !== 'READY' ? (
            <PendingView status={status} handleClose={handleClose} />
          ) : (
            <View style={styles.innerContainer}>
              <View style={styles.outterContainer}>
                <View style={styles.top}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.closeText}>X</Text>
                  </TouchableOpacity>
                  <Text style={styles.instruction}>
                    Scan QR code to join baby room
                  </Text>
                </View>
                <View style={styles.middle}>
                  <View style={styles.middleLeft} />
                  <View style={styles.middleRight} />
                </View>
                <View style={styles.bottom}>
                  <Button
                    primary
                    text="Enter Room ID Manually"
                    onPress={handleCamToggle}
                  />
                  {room && (
                    <Button
                      secondary
                      text="Join Recent"
                      onPress={handleJoinRecent}
                    />
                  )}
                </View>
              </View>
            </View>
          )
        }
      </RNCamera>
    </View>
  )
}

const styles = {
  container: {
    width: '100%',
    backgroundColor: 'gray',
    flex: 1,
    paddingHorizontal: 0,
  },
  buttonCont: {
    width: '100%',
    height: '50%',
  },
  waiting: {
    flex: 1,
    width: '100%',
    backgroundColor: Color.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  closeButton: {
    zIndez: 1,
    backgroundColor: Color.secondary,
    position: 'absolute',
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: Font.xlarge,
    fontWeight: 'bold',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  outterContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
  },
  top: {
    width: '100%',
    height: '25%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  middle: {
    width: '100%',
    height: '41%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  middleLeft: {
    height: '100%',
    width: '10%',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  middleRight: {
    height: '100%',
    width: '10%',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  bottom: {
    width: '100%',
    height: '35%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 30,
  },
  instruction: {
    marginBottom: Size.large,
    color: Color.white,
    fontSize: Font.regular,
    fontFamily: FontFam.kaisei,
  },
}

export default ScanFreq