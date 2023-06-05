import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Color, Size, FontFam, Font } from '../Theme/Theme'

export const Button = ({ onPress, text, primary, secondary, icon }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: primary ? Color.primary : Color.secondary },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.buttonText,
          { color: primary ? Color.white : Color.black },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  )
}

const styles = {
  button: {
    paddingHorizontal: Size.regular,
    backgroundColor: Color.background,
    borderRadius: Size.small,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: Size.xxxxlarge,
    marginTop: Size.xlarge,
  },
  buttonText: {
    fontFamily: FontFam.poet,
    fontSize: Font.large,
  },
}
