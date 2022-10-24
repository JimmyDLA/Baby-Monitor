import React, { useState, useEffect } from 'react'
import { Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import axios from 'axios'
import { useTheme } from '@/Hooks'

const URL = 'http://localhost:3000'

const Home = ({ setNav, setGame, saveNewFreq }) => {
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const [freq, setFreq] = useState('')
  const [joinFreq, setJoinFreq] = useState('')

  useEffect(() => {
    console.log('useEffect')
  }, [])

  const getUuid = () => {
    axios({ method: 'get', url: URL })
      .then(response => {
        setFreq(response.data)
      })
      .catch(err => console.log(err))
  }

  const handleCreateFreq = () => {
    setGame(true)
  }

  const handleJoinFreq = () => {
    saveNewFreq(joinFreq)
    setNav({ screen: 'JoinFreq', params: joinFreq })
  }

  const handleOnChange = e => {
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
  },
  container: {
    width: '100%',
    height: 300,
    backgroundColor: 'white',
  },
}

export default Home
