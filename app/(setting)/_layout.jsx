import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
        }}>
            <Stack.Screen
                name="(profile)"
                options={{
                    title: 'Profile Settings',
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="(other)"
                options={{
                    title: 'Other Settings',
                    presentation: 'card',
                }}
            />
            <Stack.Screen
                name="(legal)"
                options={{
                    title: 'Legal Settings',
                    presentation: 'card',
                }}
            />
            <Stack.Screen
                name="ContactSettings"
                options={{
                    title: 'Contact Settings',
                    presentation: 'card',
                }}
            /><Stack.Screen
                name="LanguageSettings"
                options={{
                    title: 'Language Settings',
                    presentation: 'card',
                }}
            />

        </Stack>
    );
}