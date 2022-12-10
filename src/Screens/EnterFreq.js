import React, { useState, useEffect } from 'react'
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import { RNCamera } from 'react-native-camera'

const PendingView = () => (
  <View style={styles.waiting}>
    <Text>Waiting</Text>
  </View>
)

const EnterFreq = ({ setNav, setGame, saveNewFreq }) => {
  const [freq, setFreq] = useState('')
  const [joinFreq, setJoinFreq] = useState('')
  const [QRCodeRead, setQRCodeRead] = useState(false)

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

  return false ? (
    <View style={styles.container}>
      <View style={styles.buttonCont}>
        <TouchableOpacity style={styles.button} onPress={handleCreateFreq}>
          <Text style={styles.buttonText}>Scan Frequency</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputCont}>
        <TextInput
          placeholder="Enter Frequency"
          onChangeText={handleOnChange}
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleJoinFreq}>
          <Text style={styles.buttonText}>Join Frequency</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
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
        {({ status }) => {
          status === 'READY' ? (
            <View style={styles.innerCamera}>
              <View style={styles.verticalOverlay} />
              <View style={styles.row2Container}>
                <View style={styles.row2}>
                  <View style={styles.horizontalOverlay} />
                  <View style={styles.cameraHole} />
                  <View style={styles.horizontalOverlay} />
                </View>
              </View>
              <View style={styles.verticalOverlay} />
            </View>
          ) : (
            <PendingView />
          )
        }}
      </RNCamera>
    </View>
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
    backgroundColor: '#27ae60',
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
    // justifyContent: 'flex-end',
    alignItems: 'center',
  },
  innerCamera: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'pink',
    zindez: 99,
  },
  verticalOverlay: {
    height: '6%',
    width: 100,
    backgroundColor: 'pink',
  },
  row2Container: {
    width: '100%',
    height: '90%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  row2: {
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  horizontalOverlay: {
    height: '100%',
    width: '5%',
    backgroundColor: 'pink',
  },
  cameraHole: {
    width: '90%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
}

export default EnterFreq
