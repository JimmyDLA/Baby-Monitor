import React, { useState, useEffect } from 'react'
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
    // saveNewFreq(joinFreq)
    setNav({ screen: 'EnterFreq', params: joinFreq })
  }

  const handleOnChange = e => {
    setJoinFreq(e)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleCreateFreq}>
        <Text style={styles.buttonText}>Create Frequency</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleJoinFreq}>
        <Text style={styles.buttonText}>Join Frequency</Text>
      </TouchableOpacity>
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
}

export default Home
