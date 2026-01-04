import { DEFAULT_COST } from "@/assets";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import {
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  View,
  Image,
} from "react-native";

const WelcomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 ">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-4 flex bg-neutral-50"
      >
        <View className="flex-1 justify-center items-center space-y-4">
          <View className="w-full rounded-lg">
            <ThemedText type="title" className="text-custom-1">
              <ThemedText className="text-black" type="title">
                Selamat Datang di{" "}
              </ThemedText>
              {"APP_NAME"}
            </ThemedText>
            <ThemedText type="subtitle">{"APP_TEXT.SLOGAN"}</ThemedText>
          </View>
          <Image
            source={DEFAULT_COST}
            className="w-full h-40 rounded-lg object-cover mb-4"
          />
          <View className="flex flex-row justify-around items-center w-full">
            <TouchableOpacity
              className="bg-white border-custom-1 border px-2 py-2 rounded-lg flex items-center justify-center h-10 space-x-2 w-[45%]"
              onPress={() => router.replace("/register")}
            >
              <ThemedText className="text-sm text-custom-1 text-center">
                Daftar
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-custom-1 px-2 py-2 rounded-lg flex items-center justify-center h-10 space-x-2 w-[45%]"
              onPress={() => router.replace("/login")}
            >
              <ThemedText className="text-sm text-white text-center">
                Masuk
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
