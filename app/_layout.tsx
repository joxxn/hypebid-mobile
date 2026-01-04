import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { LogBox } from "react-native";

LogBox.ignoreAllLogs();
SplashScreen.preventAutoHideAsync();
export default function Layout() {
  const [fontsLoaded, fontsError] = useFonts({
    "Outfit-Thin": require("@/assets/fonts/Outfit-Thin.ttf"),
    "Outfit-ExtraLight": require("@/assets/fonts/Outfit-ExtraLight.ttf"),
    "Outfit-Light": require("@/assets/fonts/Outfit-Light.ttf"),
    "Outfit-Regular": require("@/assets/fonts/Outfit-Regular.ttf"),
    "Outfit-Medium": require("@/assets/fonts/Outfit-Medium.ttf"),
    "Outfit-SemiBold": require("@/assets/fonts/Outfit-SemiBold.ttf"),
    "Outfit-Bold": require("@/assets/fonts/Outfit-Bold.ttf"),
    "Outfit-ExtraBold": require("@/assets/fonts/Outfit-ExtraBold.ttf"),
    "Outfit-Black": require("@/assets/fonts/Outfit-Black.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="sell" options={{ headerShown: false }} />
        <Stack.Screen name="withdraw" options={{ headerShown: false }} />
        <Stack.Screen name="auction" options={{ headerShown: false }} />
        <Stack.Screen name="detail-transaction" options={{ headerShown: false }} />
        <Stack.Screen name="payment" options={{ headerShown: false }} />
        <Stack.Screen
          name="change-password"
          options={{
            headerShown: true,
            title: "Change Password",
            headerTitleStyle: {
              color: "#000000",
              fontFamily: "Outfit-SemiBold",
            },
          }}
        />
        <Stack.Screen
          name="request-withdrawal"
          options={{
            headerShown: true,
            title: "Request Withdrawal",
            headerTitleStyle: {
              color: "#000000",
              fontFamily: "Outfit-SemiBold",
            },
          }}
        />
        <Stack.Screen
          name="create-auction"
          options={{
            headerShown: true,
            title: "Create Auction",
            headerTitleStyle: {
              color: "#000000",
              fontFamily: "Outfit-SemiBold",
            },
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: true,
            title: "Edit Profile",
            headerTitleStyle: {
              color: "#000000",
              fontFamily: "Outfit-SemiBold",
            },
          }}
        />

        {/* <Stack.Screen
          name="detail-cost"
          options={{
            title: "",
            headerTintColor: "#FFFFFF",
            headerTransparent: true,
            headerStyle: { backgroundColor: "transparent" },
          }}
        /> */}
      </Stack>
      <Toast />
    </>
  );
}
