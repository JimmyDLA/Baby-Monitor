import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const Home = ({ setNav, setGame }) => {
  const handleCreateFreq = () => {
    setGame(true)
  }

  const handleJoinFreq = () => {
    setNav({ screen: 'EnterFreq' })
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
    backgroundColor: 'rgb(46,103,188)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
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
