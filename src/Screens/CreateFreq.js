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
import { useTheme } from '@/Hooks'

const CreateFreq = ({ startNewFrequency }) => {
  const { Common, Fonts, Gutters, Layout } = useTheme()

  useEffect(() => {
    console.log('create freq useEffect')
    // startNewFrequency()
  }, [])

  const handleNewFreq = () => {
    const URL = 'http://localhost:3000'
    startNewFrequency()
    // axios({ method: 'get', url: URL })
    //   .then(response => {
    //     // setFreq(response.data)

    //     // localPeer.on('open', localPeerId => {
    //     //   socket.current.emit('join-freq', response.data, localPeerId)
    //     // })
    //   })
    //   .catch(err => console.log(err))
  }
  return (
    <View style={styles.preview}>
      <Text>CREATE FREQUENCY</Text>
      <TouchableOpacity
        style={[Common.button.outline, Gutters.regularBMargin]}
        onPress={handleNewFreq}
      >
        <Text style={Fonts.textRegular}>open Freq</Text>
      </TouchableOpacity>
    </View>
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
    justifyContent: 'center',
    backgroundColor: 'pink',
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

export default CreateFreq
