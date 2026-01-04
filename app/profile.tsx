import { ThemedText } from "@/components/ThemedText";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomInputText } from "@/components/ui/CustomInputText";
import { Img } from "@/components/ui/Img";
import api from "@/config/api";
import { toastError, toastLoading, toastSuccess } from "@/helper/toast";
import { useProfile } from "@/hooks/useProfile";
import { Api } from "@/models/Response";
import { User } from "@/models/User";
import { Kyc } from "@/models/Kyc";
import { showPickerOptions } from "@/utils/pickImage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

interface KycStatusData {
  status: "none" | "Pending" | "Accepted" | "Rejected";
  kyc: Kyc | null;
}

const KycStatusBadge = ({
  kycData,
  onVerify,
}: {
  kycData: KycStatusData;
  onVerify: () => void;
}) => {
  const { status } = kycData;

  const getStatusConfig = () => {
    switch (status) {
      case "Pending":
        return {
          bgColor: "bg-amber-100",
          textColor: "text-amber-700",
          icon: "time-outline" as const,
          iconColor: "#B45309",
          label: "KYC Pending",
          description: "Your verification is being reviewed",
          showAction: false,
        };
      case "Accepted":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          icon: "checkmark-circle-outline" as const,
          iconColor: "#15803D",
          label: "KYC Verified",
          description: "Your identity has been verified",
          showAction: false,
        };
      case "Rejected":
        return {
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          icon: "close-circle-outline" as const,
          iconColor: "#B91C1C",
          label: "KYC Rejected",
          description: "Your verification was rejected. Please try again.",
          showAction: true,
        };
      case "none":
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          icon: "alert-circle-outline" as const,
          iconColor: "#374151",
          label: "KYC Not Submitted",
          description: "Verify your identity to unlock all features",
          showAction: true,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View className={`${config.bgColor} rounded-xl p-4 mb-6 mt-4`}>
      <View className="flex-row items-center mb-2">
        <Ionicons name={config.icon} size={24} color={config.iconColor} />
        <ThemedText
          type="defaultSemiBold"
          className={`${config.textColor} ml-2`}
        >
          {config.label}
        </ThemedText>
      </View>
      <ThemedText type="default" className={`${config.textColor} opacity-80`}>
        {config.description}
      </ThemedText>
      {config.showAction && (
        <TouchableOpacity
          onPress={onVerify}
          className="bg-blue-600 rounded-lg py-3 mt-3"
          activeOpacity={0.8}
        >
          <ThemedText
            type="defaultSemiBold"
            className="text-white text-center"
          >
            {status === "Rejected" ? "Retry Verification" : "Verify Now"}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const EditProfilePage = () => {
  const {
    handleEditProfile,
    form,
    loading,
    onChange,
    handleChangeImage,
    handleDeletePicture,
    kycData,
    fetchKycStatus,
  } = useEditProfile();

  const { profile } = useProfile();

  useFocusEffect(
    useCallback(() => {
      fetchKycStatus();
    }, [])
  );

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

  const handleNavigateToKyc = () => {
    router.push("/kyc-verification");
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

      {/* KYC Status Section */}
      <KycStatusBadge kycData={kycData} onVerify={handleNavigateToKyc} />

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
  const [kycData, setKycData] = useState<KycStatusData>({
    status: "none",
    kyc: null,
  });

  const onChange = (key: keyof EditProfileDTO, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const fetchKycStatus = async () => {
    try {
      const res = await api.get<Api<Kyc | null>>("/account/check-kyc");
      const kyc = res.data.data;

      if (kyc === null) {
        setKycData({ status: "none", kyc: null });
      } else {
        setKycData({ status: kyc.status, kyc });
      }
    } catch (error) {
      console.log("Error fetching KYC status:", error);
      setKycData({ status: "none", kyc: null });
    }
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
    kycData,
    fetchKycStatus,
  };
};

export default EditProfilePage;
