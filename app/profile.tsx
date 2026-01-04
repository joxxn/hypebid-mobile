import { ThemedText } from "@/components/ThemedText";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomInputText } from "@/components/ui/CustomInputText";
import { Img } from "@/components/ui/Img";
import api from "@/config/api";
import { toastError, toastLoading, toastSuccess } from "@/helper/toast";
import { useProfile } from "@/hooks/useProfile";
import { Api } from "@/models/Response";
import { User } from "@/models/User";
import { showPickerOptions } from "@/utils/pickImage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";

const EditProfilePage = () => {
  const {
    handleEditProfile,
    form,
    loading,
    onChange,
    handleChangeImage,
    handleDeletePicture,
  } = useEditProfile();

  const { profile } = useProfile();

  const onClickImage = () => {
    showPickerOptions(
      {
        directlyCallback: handleChangeImage,
      },
      {
        callbackDeleteImage: handleDeletePicture,
        camera: true,
        deleteImage: !!profile.image,
        gallery: true,
      }
    );
  };
  return (
    <View className="flex-1 flex flex-col space-y-4 px-4 py-8">
      <View>
        <TouchableOpacity
          className="w-24 h-24 rounded-full mx-auto mb-8"
          onPress={onClickImage}
        >
          <Img
            type="profile"
            className="w-24 h-24 rounded-full mx-auto"
            uri={profile.image}
          />
        </TouchableOpacity>
        <ThemedText type="subtitle">Edit Profile</ThemedText>
        <ThemedText type="defaultSemiBold" className="text-neutral-700">
          Update your profile information
        </ThemedText>
      </View>
      <View className="space-y-4">
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
        <CustomButton
          loading={loading}
          onPress={handleEditProfile}
          text="Save"
        />
      </View>
      <Toast />
    </View>
  );
};

interface EditProfileDTO {
  name: string;
  email: string;
  phone: string;
}

const initProfile: EditProfileDTO = {
  name: "",
  email: "",
  phone: "",
};

const useEditProfile = () => {
  const { updateProfile, fetchData } = useProfile();
  const [form, setForm] = useState<EditProfileDTO>(initProfile);
  const [loading, setLoading] = useState(false);

  const onChange = (key: keyof EditProfileDTO, value: string) => {
    setForm({ ...form, [key]: value });
  };

  useFocusEffect(
    useCallback(() => {
      fetchData().then((res) => {
        res && setForm(res);
      });
    }, [])
  );

  const handleEditProfile = async () => {
    try {
      Object.values(form).forEach((value) => {
        if (value === "") {
          throw new Error("Fill in all fields");
        }
      });
      if (loading) return;
      setLoading(true);
      toastLoading();
      const res = await api.put<Api<User>>("/account", form);
      await updateProfile(res.data.data);
      toastSuccess(res?.data?.message);
    } catch (error) {
      toastError(error);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    const res = await api.get<Api<User>>("/account");
    return res.data.data;
  };

  const handleChangeImage = async (image: ImagePicker.ImagePickerAsset) => {
    try {
      if (loading) return;
      setLoading(true);
      const formData = new FormData();
      formData.append("image", {
        name: image?.fileName || "image.jpg",
        type: "image/jpg",
        uri: image.uri,
      } as any);
      const res = await api.patch<Api<User>>("/account", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const resProfile = await refetch();
      await updateProfile(resProfile);
      toastSuccess(res.data.message);
    } catch (error) {
      console.log(error);
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePicture = async () => {
    try {
      if (loading) return;
      setLoading(true);
      const res = await api.delete<Api<User>>("/account");
      const resProfile = await refetch();
      await updateProfile(resProfile);
      toastSuccess(res.data.message);
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
    handleEditProfile,
    loading,
    handleChangeImage,
    handleDeletePicture,
  };
};

export default EditProfilePage;
