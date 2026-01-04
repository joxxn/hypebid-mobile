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

const RegisterScreen = () => {
  const { form, handleRegister, loading, onChange } = useRegister();

  return (
    <SafeAreaView className="flex-1 ">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-4 flex bg-neutral-50"
      >
        <View className="flex-1 justify-center items-center">
          <View className="w-full rounded-lg">
            <ThemedText type="title" className="text-custom-1">
              Register
            </ThemedText>
            <ThemedText type="subtitle">
              Be Our
              <ThemedText className="text-custom-1" type="subtitle">
                {" "}
                HypeBid{" "}
              </ThemedText>
              Family
            </ThemedText>

            <View className="mt-8 space-y-4">
              <CustomInputText
                onChangeText={(text) => onChange("name", text)}
                value={form.name}
                label="Full Name"
                placeholder="John Doe"
              />
              <CustomInputText
                onChangeText={(text) => onChange("email", text)}
                value={form.email}
                label="Email"
                placeholder="user@example.com"
                keyboardType="email-address"
              />
              <CustomInputText
                onChangeText={(text) => onChange("phone", text)}
                value={form.phone}
                label="Phone"
                placeholder="621234567"
                keyboardType="phone-pad"
              />
              <CustomInputText
                onChangeText={(text) => onChange("password", text)}
                value={form.password}
                label="Password"
                placeholder="*******"
                secureTextEntry
              />
              <View className="mt-4">
                <CustomButton
                  loading={loading}
                  onPress={handleRegister}
                  text="Register"
                />
                <View className="flex flex-row justify-between items-center my-6">
                  <View className="h-px w-[30%] bg-neutral-200" />
                  <ThemedText className="text-black">
                    Have an account?
                  </ThemedText>
                  <View className="h-px w-[30%] bg-neutral-200" />
                </View>
                <TouchableOpacity
                  className="bg-white border-custom-1 border px-2 py-2 rounded-lg flex items-center justify-center h-10 space-x-2"
                  onPress={() => router.replace("/login")}
                >
                  <ThemedText className="text-sm text-custom-1 text-center">
                    Login
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

export default RegisterScreen;

interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phone: string;
}

const initRegisterDTO: RegisterDTO = {
  name: "",
  email: "",
  password: "",
  phone: "",
};

const useRegister = () => {
  const [form, setForm] = useState<RegisterDTO>(initRegisterDTO);
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useProfile();

  const onChange = (key: keyof RegisterDTO, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleRegister = async () => {
    try {
      Object.values(form).forEach((value) => {
        if (value === "") {
          throw new Error("Fill in all fields");
        }
      });
      const emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailRegex.test(String(form.email).toLowerCase())) {
        throw new Error("Email is not valid");
      }
      if (!form.phone.startsWith("62")) {
        throw new Error("Phone number must start with 62");
      }
      if (loading) return;
      setLoading(true);
      toastLoading();
      const res = await api.post<Api<User>>("/account/register", {
        ...form,
        email: form.email.toLowerCase(),
      });
      await AsyncStorage.setItem(ACCESS_TOKEN, res.data.data.accessToken);
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
    handleRegister,
    loading,
  };
};
