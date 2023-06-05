import React, { useState, useEffect } from 'react'
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { ScreenContainer } from '../Components/ScreenContainer'
import { Button } from '../Components/Button'
import { Font, FontFam, Color, Size } from '@/Theme/Theme'

const PendingView = () => (
  <View style={styles.waiting}>
    <Text>Waiting</Text>
  </View>
)

const EnterFreq = ({ setNav, setGame, saveNewFreq, room }) => {
  const [isScanning, setIsScanning] = useState(true)
  const [joinFreq, setJoinFreq] = useState('')
  const [QRCodeRead, setQRCodeRead] = useState(false)

  useEffect(() => {
    return () => {
      console.log('[INFO] EnterFreq cleanup ')
    }
  }, [QRCodeRead])

  const handleCreateFreq = () => {
    setGame(true)
  }

  const handleJoinFreq = () => {
    if (!joinFreq) {
      Alert.alert(
        "Can't Join",
        "Can't join without a frequency. Please enter a frequency ID to join.",
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
      )
    } else {
      saveNewFreq(joinFreq)
      setNav({ screen: 'JoinFreq', params: joinFreq })
    }
  }

  const handleOnChange = e => {
    setJoinFreq(e)
  }

  const handleQRCode = e => {
    if (!QRCodeRead) {
      console.log('[INFO] EnterFreq', e.data)
      setQRCodeRead(true)
      saveNewFreq(e.data)
      setNav({ screen: 'JoinFreq' })
    }
  }

  const handleCamToggle = () => {
    setIsScanning(!isScanning)
  }

  const handleJoinRecent = () => {
    if (room) {
      saveNewFreq(room)
      setNav({ screen: 'JoinFreq' })
    }
  }

  return isScanning ? (
    <View style={[styles.container, { paddingHorizontal: 0 }]}>
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
            <PendingView />
          ) : (
            <View style={styles.innerContainer}>
              <View style={styles.outterContainer}>
                <View style={styles.top}>
                  <Text style={styles.instruction}>
                    Scan QR code to join frequency
                  </Text>
                </View>
                <View style={styles.middle}>
                  <View style={styles.middleLeft} />
                  <View style={styles.middleRight} />
                </View>
                <View style={styles.bottom}>
                  <Button
                    primary
                    text="Enter Frequency ID Manually"
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
  ) : (
    <ScreenContainer>
      <View style={styles.buttonCont}>
        <Button primary text="Scan Frequency" onPress={handleCamToggle} />
      </View>

      <View style={styles.inputCont}>
        <TextInput
          placeholder="Enter Frequency"
          onChangeText={handleOnChange}
          style={styles.input}
        />
        <Button secondary text="Join Frequency" onPress={handleJoinFreq} />
      </View>
    </ScreenContainer>
  )
}

const styles = {
  container: {
    width: '100%',
    backgroundColor: 'gray',
    flex: 1,
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    height: 65,
    borderColor: 'white',
    borderWidth: 2,
    marginVertical: 10,
    padding: 10,
    color: 'white',
  },
  button: {
    marginTop: 30,
    height: 65,
    width: '100%',
    backgroundColor: 'rgb(46,103,188)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
  },
  buttonCont: {
    width: '100%',
    height: '50%',
  },
  waiting: {
    flex: 1,
    backgroundColor: 'lightgreen',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
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
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middle: {
    width: '100%',
    height: '40%',
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
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 30,
  },
  instruction: {
    marginBottom: Size.xlarge,
    color: Color.white,
    fontSize: Font.regular,
    fontFamily: FontFam.kaisei,
  },
}

export default EnterFreq
