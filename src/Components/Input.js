import React from 'react'
import { Text, TextInput } from 'react-native'
import { Color, Size, FontFam, Font } from '../Theme/Theme'

export const Input = ({ placeholder, onChange }) => {
  return (
    <TextInput
      onChangeText={onChange}
      placeholder={placeholder}
      style={styles.input}
      autoCapitalize="none"
      autoComplete="off"
      autoCorrect={false}
    />
  )
}

const styles = {
  input: {
    width: '100%',
    height: Size.xxxxlarge,
    marginTop: Size.xlarge,
    borderColor: Color.primary,
    borderRadius: Size.xxlarge,
    fontSize: Font.xlarge,
    fontFamily: FontFam.kaisei,
    borderWidth: 3,
    paddingLeft: Size.xlarge,
    paddingRight: Size.xlarge,
  },
}
