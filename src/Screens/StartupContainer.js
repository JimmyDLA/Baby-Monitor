import React, { useEffect } from 'react'
import { Image, View } from 'react-native'
import { useTheme } from '@/Hooks'
import { setDefaultTheme } from '@/Store/Theme'
import { navigate } from '@/Navigators/utils'
import { Size } from '../Theme/Theme'
import launchScreen from '../../assets/images/launch_screen.png'

const StartupContainer = () => {
  const { Layout } = useTheme()

  const init = async () => {
    await new Promise(resolve =>
      setTimeout(() => {
        resolve(true)
      }, 2000),
    )
    await setDefaultTheme({ theme: 'default', darkMode: null })
    navigate('Home')
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <View style={[Layout.fill, Layout.colCenter]}>
      <Image style={styles.img} source={launchScreen} />
    </View>
  )
}

const styles = {
  img: {
    height: Size.full,
    width: Size.full,
  },
}

export default StartupContainer
