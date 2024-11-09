import React, { useState } from 'react'
import { View, Alert } from 'react-native'
import { Input, Button, ScreenContainer } from '../Components'

const TypeFreq = ({ setNav, saveNewFreq }) => {
  const [joinFreq, setJoinFreq] = useState('')

  const handleScanScreen = () => {
    setNav({ screen: 'ScanFreq' })
  }

  const handleOnChange = e => {
    setJoinFreq(e)
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

  return (
    <ScreenContainer>
      <View style={styles.buttonCont}>
        <Button primary text="Scan QR code" onPress={handleScanScreen} />
      </View>

      <View style={styles.inputCont}>
        <Input placeholder="Entre Room ID" onChange={handleOnChange} />
        <Button secondary text="Enter Room" onPress={handleJoinFreq} />
      </View>
    </ScreenContainer>
  )
}

const styles = {
  buttonCont: {
    width: '100%',
    height: '50%',
  },
}

export default TypeFreq
