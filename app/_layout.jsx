import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "../context/AuthContext";

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              gestureEnabled: true,
            }}
          >
            <Stack.Screen
              name="authentication"
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
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
