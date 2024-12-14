import React, { useRef, useState } from 'react'
import { Animated, Text, View, Image } from 'react-native'
import { Button, ScreenContainer } from '../Components'
import { Font, FontFam, Size } from '@/Theme/Theme'
import logo from '../../assets/images/logo_name.png'
import launchScreen from '../../assets/images/launch_screen.png'
import firebase from '@react-native-firebase/app'
import analytics from '@react-native-firebase/analytics'
// import {
//   getUniqueId,
//   getCarrier,
//   getBatteryLevel,
//   getDeviceType,
//   isEmulator,
// } from 'react-native-device-info'

const Home = ({ setNav, setGame }) => {
  const [isVisible, setIsVisible] = useState(true)
  console.log(
    firebase.apps.length > 0
      ? 'Firebase Initialized'
      : 'Firebase Not Initialized',
  )

  // useEffect(() => {
  //   async function logInitialAnalytics() {
  //     const isSumlator = await isEmulator()
  //     const deviceId = await getUniqueId()
  //     const deviceType = getDeviceType()
  //     const idInst = await analytics().getAppInstanceId()
  //     let crashObj = { idInst, isSumlator, deviceId, deviceType }
  //     await analytics().logEvent('home_page')

  //     if (!isSumlator) {
  //       const battery = await getBatteryLevel()
  //       const carrier = await getCarrier()
  //       const tempObj = { battery, carrier }
  //       crashObj = { ...tempObj }
  //     }
  //     console.warn(`${JSON.stringify(crashObj)}`)
  //     crashlytics().log(`${JSON.stringify(crashObj)}`)
  //   }

  //   logInitialAnalytics()
  // }, [])

  const handleCreateFreq = () => {
    setGame(true)
  }

  const handleJoinFreq = async () => {
    try {
      // throw 'error'
      setNav({ screen: 'ScanFreq' })
    } catch (error) {
      console.warn(error)
      await analytics().logEvent('analy_join_freq_button')
      // crashlytics().recordError(error, 'crash_join_freq_button')
    }
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
    fontFamily: FontFam.nowy,
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
