import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
} from 'react-native'

const JoinFreq = () => {
  useEffect(() => {
    console.log('JoinFreq useEffect')
  })

  return (
    <View style={styles.preview}>
      <Text>JOIN FREQUENCY</Text>
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
    backgroundColor: 'teal',
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

export default JoinFreq
