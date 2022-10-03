import React, { useEffect } from 'react'
import { View, Text } from 'react-native'

const CreateFreq = ({ startNewFrequency }) => {
  useEffect(() => {
    console.log('create freq useEffect')
  }, [])

  return (
    <View style={styles.preview}>
      <Text>CREATE FREQUENCY</Text>
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
  },
  container: {
    width: '100%',
    height: 300,
    backgroundColor: 'white',
  },
}

export default CreateFreq
