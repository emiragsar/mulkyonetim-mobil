import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const ButtonLayout = ({ ButtonText, color1, onClick }) => {
    return (
        <View>
            <Pressable onPress={onClick} style={[styles.buttonStyle, { backgroundColor: color1 === '#09b2e5' ? '#09b2e5' : '#fff', borderWidth: color1 !== '#09b2e5' ? 1 : 0, borderColor: color1 !== '#09b2e5' ? '#09b2e5' : '#fff' }]}>
                <Text style={[styles.text, { color: color1 === '#09b2e5' ? '#fff' : '#09b2e5' }]}>{ButtonText}</Text>

            </Pressable>
        </View>
    )
}
const styles = StyleSheet.create({
    buttonStyle: {
        width: '100%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
        color: '#fff',
    },

})
export default ButtonLayout