import { ACCESS_TOKEN } from "@/constants/AsyncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { View, Animated, Image } from "react-native";

const IndexScreen = () => {
  useAuth();
  return (
    <View className="w-full h-full bg-custom-1 flex items-center justify-center">
      <Image
        source={require("@/assets/images/logo.png")}
        className="w-40 h-40"
      />
    </View>
  );
};

const useAuth = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      checkToken();
    });
  }, [fadeAnim]);

  const checkToken = async () => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN);
    if (token) {
      router.replace("/(home)");
    } else {
      router.replace("/login");
    }
  };
};

export default IndexScreen;
