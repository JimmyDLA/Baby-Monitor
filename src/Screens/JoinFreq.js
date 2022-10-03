import React, { useEffect } from 'react'
import { View, Text } from 'react-native'

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
  },
  container: {
    width: '100%',
    height: 300,
    backgroundColor: 'white',
  },
}

export default JoinFreq