import { ThemedText } from "@/components/ThemedText";
import { CustomButton } from "@/components/ui/CustomButton";
import api from "@/config/api";
import { toastError, toastLoading, toastSuccess } from "@/helper/toast";
import { Api } from "@/models/Response";
import { Kyc } from "@/models/Kyc";
import { router } from "expo-router";
import { useState } from "react";
import { Image, TouchableOpacity, View, Alert } from "react-native";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const compressKycImage = async (uri: string) => {
    // Compress for KYC - larger size to maintain readability but still uploadable
    const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult;
};

const KycVerificationPage = () => {
    const [selectedImage, setSelectedImage] =
        useState<ImagePicker.ImagePickerAsset | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "Please grant gallery access to upload KYC document"
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 2],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageAsset = result.assets[0];
            const compressed = await compressKycImage(imageAsset.uri);
            setSelectedImage({ ...imageAsset, uri: compressed.uri });
        }
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "Please grant camera access to take KYC photo"
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [3, 2],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageAsset = result.assets[0];
            const compressed = await compressKycImage(imageAsset.uri);
            setSelectedImage({ ...imageAsset, uri: compressed.uri });
        }
    };

    const handleSubmitKyc = async () => {
        if (!selectedImage) {
            Alert.alert("Error", "Please select or take a photo of your KTP");
            return;
        }

        try {
            setLoading(true);
            toastLoading();

            const formData = new FormData();
            formData.append("image", {
                name: selectedImage.fileName || "kyc-document.jpg",
                type: "image/jpeg",
                uri: selectedImage.uri,
            } as any);

            const res = await api.post<Api<Kyc>>("/account/verify-kyc", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toastSuccess(res.data.message);
            router.back();
        } catch (error: any) {
            // Display server error message for validation feedback
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to submit KYC";
            toastError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            "Select Image Source",
            "Choose how you want to upload your KTP",
            [
                {
                    text: "Camera",
                    onPress: handleTakePhoto,
                },
                {
                    text: "Gallery",
                    onPress: handlePickFromGallery,
                },
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-4 py-6">
            {/* Back Button */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="flex-row items-center mb-4"
                activeOpacity={0.7}
            >
                <Ionicons name="arrow-back" size={24} color="#374151" />
                <ThemedText type="defaultSemiBold" className="text-gray-700 ml-2">
                    Back
                </ThemedText>
            </TouchableOpacity>

            {/* Header */}
            <View className="mb-6">
                <ThemedText type="subtitle" className="text-gray-900">
                    KYC Verification
                </ThemedText>
                <ThemedText type="default" className="text-gray-500 mt-1">
                    Upload a clear photo of your Indonesian ID Card (KTP) for
                    verification
                </ThemedText>
            </View>

            {/* Image Upload Area */}
            <TouchableOpacity
                onPress={showImageOptions}
                className="w-full aspect-[3/2] rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 items-center justify-center overflow-hidden mb-6"
                activeOpacity={0.7}
            >
                {selectedImage ? (
                    <Image
                        source={{ uri: selectedImage.uri }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="items-center">
                        <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-4">
                            <Ionicons name="camera-outline" size={40} color="#3B82F6" />
                        </View>
                        <ThemedText type="defaultSemiBold" className="text-gray-700">
                            Tap to upload KTP
                        </ThemedText>
                        <ThemedText type="default" className="text-gray-400 mt-1 text-sm">
                            Use camera or select from gallery
                        </ThemedText>
                    </View>
                )}
            </TouchableOpacity>

            {/* Change Image Button */}
            {selectedImage && (
                <TouchableOpacity
                    onPress={showImageOptions}
                    className="bg-gray-100 rounded-xl py-3 items-center mb-4"
                >
                    <ThemedText type="defaultSemiBold" className="text-gray-600">
                        Change Image
                    </ThemedText>
                </TouchableOpacity>
            )}

            {/* Instructions */}
            <View className="bg-blue-50 rounded-xl p-4 mb-6">
                <ThemedText type="defaultSemiBold" className="text-blue-800 mb-2">
                    Important Instructions:
                </ThemedText>
                <View className="space-y-1">
                    <ThemedText type="default" className="text-blue-700 text-sm">
                        • Make sure all text on KTP is clearly readable
                    </ThemedText>
                    <ThemedText type="default" className="text-blue-700 text-sm">
                        • Avoid glare and shadows on the card
                    </ThemedText>
                    <ThemedText type="default" className="text-blue-700 text-sm">
                        • Take photo in good lighting conditions
                    </ThemedText>
                    <ThemedText type="default" className="text-blue-700 text-sm">
                        • Ensure all corners of the KTP are visible
                    </ThemedText>
                </View>
            </View>

            {/* Submit Button */}
            <CustomButton
                onPress={handleSubmitKyc}
                text={selectedImage ? "Submit for Verification" : "Select Image First"}
                loading={loading}
            />

            <Toast />
        </SafeAreaView>
    );
};

export default KycVerificationPage;
