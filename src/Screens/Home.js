import React, { useRef, useState } from 'react'
import { Animated, Text, View, Image } from 'react-native'
import { Button, ScreenContainer } from '../Components'
import { Font, FontFam, Size } from '@/Theme/Theme'
import logo from '../../assets/images/Logo_Name.png'
import launchScreen from '../../assets/images/Launch_screen.png'

const Home = ({ setNav, setGame }) => {
  const [isVisible, setIsVisible] = useState(true)
  const handleCreateFreq = () => {
    setGame(true)
  }

  const handleJoinFreq = () => {
    setNav({ screen: 'EnterFreq' })
  }

  const fadeAnim = useRef(new Animated.Value(1)).current
  const fadeOut = () => {
    // Will change fadeAnim value to 0 in 3 seconds
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start()
    setTimeout(() => {
      setIsVisible(false)
    }, 1100)
  }

  return (
    <>
      {isVisible && (
        <Animated.Image
          style={[styles.launch, { opacity: fadeAnim }]}
          source={launchScreen}
          onLoad={fadeOut}
        />
      )}
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
    </>
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
    height: 186,
  },
  launch: {
    position: 'absolute',
    width: Size.full,
    height: Size.full,
    zIndex: 1,
  },
}

export default Home
