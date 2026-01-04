import { ThemedText } from "@/components/ThemedText";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomInputText } from "@/components/ui/CustomInputText";
import api from "@/config/api";
import { ACCESS_TOKEN } from "@/constants/AsyncStorage";
import { toastError, toastLoading, toastSuccess } from "@/helper/toast";
import { useProfile } from "@/hooks/useProfile";
import { Api } from "@/models/Response";
import { User } from "@/models/User";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";

const LoginScreen = () => {
  const { form, handleLogin, loading, onChange } = useLogin();

  return (
    <SafeAreaView className="flex-1 ">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-4 flex bg-neutral-50"
      >
        <View className="flex-1 justify-center items-center">
          <View className="w-full rounded-lg">
            <ThemedText type="title" className="text-custom-1">
              HypeBid
            </ThemedText>
            <ThemedText type="subtitle">Bid Your Stuff!</ThemedText>

            <View className="mt-8 space-y-4">
              <CustomInputText
                label="Email"
                placeholder="user@example.com"
                onChangeText={(value) => onChange("email", value)}
                value={form.email}
                keyboardType="email-address"
              />
              <CustomInputText
                label="Password"
                placeholder="*******"
                onChangeText={(value) => onChange("password", value)}
                value={form.password}
                secureTextEntry
              />
              <View className="mt-4">
                <CustomButton
                  loading={loading}
                  onPress={handleLogin}
                  text="Login"
                />
                <View className="flex flex-row justify-between items-center my-6">
                  <View className="h-px w-[30%] bg-neutral-200" />
                  <ThemedText className="text-black">
                    Don't have an account?
                  </ThemedText>
                  <View className="h-px w-[30%] bg-neutral-200" />
                </View>
                <TouchableOpacity
                  className="bg-white border-custom-1 border px-2 py-2 rounded-lg flex items-center justify-center h-10 space-x-2"
                  onPress={() => router.replace("/register")}
                >
                  <ThemedText className="text-sm text-custom-1 text-center">
                    Register
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface LoginDTO {
  email: string;
  password: string;
}

const initLoginDTO: LoginDTO = {
  email: "",
  password: "",
};

const useLogin = () => {
  const [form, setForm] = useState<LoginDTO>(initLoginDTO);
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useProfile();

  const onChange = (key: keyof LoginDTO, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleLogin = async () => {
    try {
      Object.values(form).forEach((value) => {
        if (value === "") {
          throw new Error("Fill in all fields");
        }
      });
      if (loading) return;
      setLoading(true);
      toastLoading();
      const res = await api.post<Api<User>>("/account/login", form);
      await AsyncStorage.setItem(ACCESS_TOKEN, res.data.data.accessToken);
      await updateProfile(res.data.data);
      toastSuccess(res?.data?.message);
      router.replace("/(home)");
    } catch (error) {
      console.log(error);
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    onChange,
    handleLogin,
    loading,
  };
};

export default LoginScreen;
