import React, { useState, useEffect } from 'react'
import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native'
import { useTheme } from '@/Hooks'

const Home = ({ setNav, setGame, saveNewFreq }) => {
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const [freq, setFreq] = useState('')
  const [joinFreq, setJoinFreq] = useState('')

  useEffect(() => {
    console.log('useEffect')
  }, [])

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

  return (
    <ScrollView
      style={styles.container}
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
        placeholder="Frequency"
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
    </ScrollView>
  )
}

const styles = {
  input: {
    width: 200,
    height: 50,
    borderColor: 'white',
    borderWidth: 2,
    marginVertical: 10,
    padding: 10,
    color: 'white',
  },
  preview: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    backgroundColor: 'gray',
    flex: 1,
  },
}

export default Home
