import React, { useState } from "react";
import { WebView } from "react-native-webview";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { C } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentScreen = () => {
  const redirectUrl = (useLocalSearchParams().redirectUrl as string) || "";
  return (
    <SafeAreaView
      style={{
        flex: 1,
        position: "relative",
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 60,
          left: 20,
          zIndex: 5,
        }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-fit h-fit p-2 rounded-lg bg-white flex justify-center items-center"
        >
          <MaterialIcons name="arrow-back" size={24} color={C[1]} />
        </TouchableOpacity>
      </View>
      <WebView
        style={{ flex: 1, zIndex: 0 }}
        originWhitelist={["*"]}
        source={{ uri: redirectUrl }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onNavigationStateChange={(event) => {
          if (event.url.includes("example")||event.url.includes("vercel")) {
            router.back();
          }
        }}
      />
    </SafeAreaView>
  );
};
export default PaymentScreen;
