import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Color, Size, FontFam, Font } from '../Theme/Theme'

export const Button = ({ onPress, text, primary, secondary }) => {
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
          { color: secondary ? Color.black : Color.white },
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
    borderRadius: Size.xxlarge,
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
