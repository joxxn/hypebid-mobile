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
import { useState } from "react";
import { View } from "react-native";

const ChangePasswordPage = () => {
  const { handle, form, loading, onChange } = usePassword();
  return (
    <View className="flex-1 flex flex-col space-y-4 px-4 py-8">
      <View>
        <ThemedText type="subtitle">Change your password</ThemedText>
        <ThemedText type="defaultSemiBold" className="text-neutral-700">
          Update your password to keep your account safe and secure
        </ThemedText>
      </View>
      <View className="space-y-4">
        <CustomInputText
          label="Old Password"
          value={form.oldPassword}
          onChangeText={(value) => onChange("oldPassword", value)}
          secureTextEntry
          placeholder="*******"
        />
        <CustomInputText
          label="New Password"
          value={form.newPassword}
          onChangeText={(value) => onChange("newPassword", value)}
          secureTextEntry
          placeholder="*******"
        />
        <CustomInputText
          label="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(value) => onChange("confirmPassword", value)}
          secureTextEntry
          placeholder="*******"
        />
        <CustomButton loading={loading} onPress={handle} text="Save" />
      </View>
    </View>
  );
};

interface ChangePassDTO {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initChangePassDTO: ChangePassDTO = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const usePassword = () => {
  const [form, setForm] = useState<ChangePassDTO>(initChangePassDTO);
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useProfile();

  const onChange = (key: keyof ChangePassDTO, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handle = async () => {
    try {
      Object.values(form).forEach((value) => {
        if (value === "") {
          throw new Error("Fill in all fields");
        }
      });
      if (form.newPassword !== form.confirmPassword) {
        throw new Error("Password doesn't match");
      }
      if (loading) return;
      setLoading(true);
      toastLoading();
      const res = await api.put<Api<User>>("/account/change-password", form);
      await updateProfile(res.data.data);
      toastSuccess(res?.data?.message);
      setForm(initChangePassDTO);
    } catch (error) {
      console.log(error);
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  return { form, onChange, handle, loading };
};

export default ChangePasswordPage;
