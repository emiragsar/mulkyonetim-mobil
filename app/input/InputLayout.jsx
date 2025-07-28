import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const InputLayout = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    rightIconName,
    onRightIconPress,
    keyboardType,
    maxLength,
    hasError,
    errorMessage,
    onBlur
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        if (isFocused || (value && value.length > 0)) {
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [isFocused, value, animatedValue]);

    const labelStyle = {
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [15, -10],
        }),
        left: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 5],
        }),
        fontSize: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 10],
        }),
        color: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['gray', '#09b2e5'],
        }),
    };

    const borderColor = hasError ? 'red' : (isFocused ? '#09b2e5' : 'gray');

    return (
        <View style={styles.outerContainer}>
            <Animated.Text style={[styles.floatingLabel, labelStyle]}>
                {placeholder}
            </Animated.Text>

            <View style={styles.inputWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            borderColor: borderColor,
                            borderWidth: 1,
                            opacity: isFocused || (value && value.length > 0) || hasError ? 1 : 0.7,
                            paddingRight: rightIconName ? 40 : 10,
                        }
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        setIsFocused(false);
                        if (onBlur) onBlur();
                    }}
                    textAlign="left"
                    textAlignVertical="center"
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                />

                {rightIconName && (
                    <Pressable
                        onPress={onRightIconPress ? onRightIconPress : undefined}
                        style={styles.rightIconContainer}
                    >
                        <MaterialCommunityIcons
                            name={rightIconName}
                            size={24}
                            color={borderColor}
                        />
                    </Pressable>
                )}
            </View>
            {hasError && errorMessage ? (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {

        width: '90%',
        marginBottom: 10,
    },
    floatingLabel: {
        position: 'absolute',
        zIndex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        position: 'relative',
        width: '100%',
    },
    input: {
        flex: 1,
        height: 50,
        fontWeight: 'bold',
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    rightIconContainer: {
        position: 'absolute',
        right: 10,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 5,
    },
    errorMessage: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 10,
    },
});

export default InputLayout;
