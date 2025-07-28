import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        >
          <Stack.Screen
            name="(screens)"
            options={{
              headerShown: false,
              title: "Auth",
            }}
          />
          <Stack.Screen
            name="(setting)"
            options={{
              headerShown: false,
              title: "Settings",
            }}
          />
          <Stack.Screen
            name="layouts"
            options={{
              headerShown: false,
              title: "Main App",
            }}
          />
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              title: "Loading",
            }}
          />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
