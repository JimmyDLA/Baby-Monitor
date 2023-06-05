import React from 'react'
import { Text, View, Image } from 'react-native'
import { ScreenContainer } from '../Components/ScreenContainer'
import { Button } from '../Components/Button'
import { Font, FontFam, Size } from '@/Theme/Theme'
import logo from '../../assets/images/Logo_Name.png'

const Home = ({ setNav, setGame }) => {
  const handleCreateFreq = () => {
    setGame(true)
  }

  const handleJoinFreq = () => {
    setNav({ screen: 'EnterFreq' })
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.top}>
          <Image resizeMode="cover" source={logo} style={styles.img} />
          <Text style={styles.text}>
            Welcome to Baby Monitor. Now its easier than ever to monitor your
            baby while they sleep. Just use any mobile device like your phone,
            tablet, or laptop.
          </Text>
        </View>
        <View>
          <Button onPress={handleCreateFreq} text="Baby's Room" primary />
          <Button onPress={handleJoinFreq} text="Parent's Room" secondary />
        </View>
      </View>
    </ScreenContainer>
  )
}

const styles = {
  container: {
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: Size.large,
  },
  text: {
    fontFamily: FontFam.kaisei,
    fontSize: Font.regular,
    paddingTop: Size.xlarge,
    textAlign: 'center',
  },
  top: {
    paddingTop: Size.xlarge,
    alignItems: 'center',
  },
  img: {
    width: 235,
    height: 185,
  },
}

export default Home
