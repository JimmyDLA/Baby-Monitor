import React from 'react'
import { View, SafeAreaView } from 'react-native'
import { Color, Size } from '../Theme/Theme'

export const ScreenContainer = ({ children }) => {
  return (
    <View style={[styles.container]}>
      <SafeAreaView>{children}</SafeAreaView>
    </View>
  )
}

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: Size.regular,
    backgroundColor: Color.background,
  },
}
