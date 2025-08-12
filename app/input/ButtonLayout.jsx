import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const ButtonLayout = ({ ButtonText, color1, onClick, disabled = false }) => {
    return (
        <View>
            <Pressable 
                onPress={onClick} 
                disabled={disabled}
                style={[
                    styles.buttonStyle, 
                    { 
                        backgroundColor: disabled ? '#ccc' : (color1 === '#09b2e5' ? '#09b2e5' : '#fff'), 
                        borderWidth: color1 !== '#09b2e5' ? 1 : 0, 
                        borderColor: color1 !== '#09b2e5' ? '#09b2e5' : '#fff',
                        opacity: disabled ? 0.6 : 1
                    }
                ]}
            >
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