import { Tabs } from "expo-router";
import Toast from "react-native-toast-message";
import Ionicons from "@expo/vector-icons/Ionicons";
import { C } from "@/constants/Colors";

export default function LayoutHome() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: C[1],
          tabBarInactiveTintColor: "#687076",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: "Home",
            headerShown: false,
            tabBarLabelStyle: {
              fontFamily: "Outfit-SemiBold",
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="bids"
          options={{
            tabBarLabel: "Bids",
            headerShown: false,
            tabBarLabelStyle: {
              fontFamily: "Outfit-SemiBold",
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="transaction"
          options={{
            tabBarLabel: "Transaction",
            headerShown: false,
            tabBarLabelStyle: {
              fontFamily: "Outfit-SemiBold",
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="receipt" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="setting"
          options={{
            tabBarLabel: "Setting",
            headerShown: false,
            tabBarLabelStyle: {
              fontFamily: "Outfit-SemiBold",
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
      <Toast />
    </>
  );
}
