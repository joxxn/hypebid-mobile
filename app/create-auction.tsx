import { ThemedText } from "@/components/ThemedText";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomInputText } from "@/components/ui/CustomInputText";
import api from "@/config/api";
import { toastError, toastLoading, toastSuccess } from "@/helper/toast";
import { useProfile } from "@/hooks/useProfile";
import { Auction } from "@/models/Auction";
import { Api } from "@/models/Response";
import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  FlatList,
  Touchable,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import SelectDropdown from "react-native-select-dropdown";
import Ionicons from "@expo/vector-icons/Ionicons";
import DatePicker from "react-native-modal-datetime-picker";
import formatDate from "@/utils/formatDate";
import { Img } from "@/components/ui/Img";
import { compressImage, showPickerOptions } from "@/utils/pickImage";
import * as FileSystem from "expo-file-system";

const CreateAuctionScreen = () => {
  const {
    handle,
    form,
    loading,
    onChange,
    categories,
    dateEndOpen,
    dateStartOpen,
    hideDateEnd,
    hideDateStart,
    showDateStart,
    showDateEnd,
    onSelectEnd,
    onSelectStart,
    images,
    onOpenImage,
    onDeleteImage,
  } = useCreateAuction();

  const { profile } = useProfile();
  return (
    <View className="flex-1 flex flex-col space-y-4 px-4">
      <ScrollView>
        <View className="mt-4">
          <ThemedText type="subtitle">Post Your Stuff</ThemedText>
          <ThemedText type="defaultSemiBold" className="text-neutral-700">
            Create an auction to sell your item
          </ThemedText>
        </View>
        <View className="space-y-4 mt-2">
          <FlatList
            data={images}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View className="w-40 mr-4 flex flex-col">
                <Img
                  uri={item.uri}
                  className="w-40 h-40 rounded-lg object-cover"
                />
                <TouchableOpacity
                  className="flex flex-row items-center justify-center px-4 py-2 bg-red-500 rounded-lg space-x-1 mt-2"
                  onPress={() => onDeleteImage(index)}
                >
                  <Ionicons name="trash-outline" size={18} color="white" />
                  <ThemedText type="label" className="text-white text-sm">
                    Delete
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
            horizontal
          />
          <View className="mt-4">
            {images.length === 0 ? (
              <TouchableOpacity
                className="w-full h-40 border border-neutral-300 rounded-lg flex flex-col items-center justify-center bg-white"
                onPress={onOpenImage}
              >
                <Ionicons name="images-outline" size={24} color="black" />
                <ThemedText type="defaultSemiBold" className="text-neutral-700">
                  Upload your images
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <CustomButton text="Upload more images" onPress={onOpenImage} />
            )}
          </View>

          <View className="h-[1px] bg-neutral-300 mb-4" />
          <CustomInputText
            label="Name"
            value={form.name}
            onChangeText={(value) => onChange("name", value)}
            placeholder="Nike Air Jordan"
          />

          <View>
            <ThemedText type="label" className="mb-2 -mt-4">
              Category
            </ThemedText>
            <SelectDropdown
              data={categories}
              onSelect={(selectedItem: string) => {
                onChange("category", selectedItem);
              }}
              renderButton={(selectedItem: string, isOpened) => {
                return (
                  <View style={styles.buttonDropdown}>
                    <ThemedText
                      type="default"
                      className={`${
                        form.category ? "text-black" : "text-[#a3a3a3]"
                      }`}
                    >
                      {form.category || "Select category"}
                    </ThemedText>
                    <Ionicons name={isOpened ? "chevron-up" : "chevron-down"} />
                  </View>
                );
              }}
              renderItem={(item: string, index, isSelected) => {
                return (
                  <View className="px-2 bg-white rounded-lg">
                    <ThemedText type="defaultSemiBold" className="px-4 my-4">
                      {item}
                    </ThemedText>
                    {index < categories.length - 1 && (
                      <View className="h-[1px] bg-neutral-300" />
                    )}
                  </View>
                );
              }}
              dropdownStyle={{
                borderRadius: 10,
                backgroundColor: "#fff",
                maxHeight: 250,
                padding: 10,
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <CustomInputText
            label="Description"
            value={form.description}
            onChangeText={(value) => onChange("description", value)}
            placeholder=""
            numberOfLines={4}
            multiline
          />
          <CustomInputText
            label="Location"
            value={form.location}
            onChangeText={(value) => onChange("location", value)}
            placeholder="Ngaglik, Sleman, Yogyakarta"
          />
          <CustomInputText
            label="Opening Price"
            value={form.openingPrice}
            onChangeText={(value) => onChange("openingPrice", value)}
            keyboardType="numeric"
            placeholder="100000"
          />
          <CustomInputText
            label="Increment Bid"
            value={form.minimumBid}
            onChangeText={(value) => onChange("minimumBid", value)}
            keyboardType="numeric"
            placeholder="10000"
          />
          <CustomInputText
            label="Buy Now Price"
            value={form.buyNowPrice}
            onChangeText={(value) => onChange("buyNowPrice", value)}
            keyboardType="numeric"
            placeholder="10000"
          />
          <View className="mb-2">
            <ThemedText type="label" className="-mt-4">
              Date Start
            </ThemedText>
            <View className="flex flex-row items-center justify-between">
              <ThemedText>
                {form.start
                  ? formatDate(form.start, true, true)
                  : "Select date"}
              </ThemedText>
              <CustomButton onPress={showDateStart} text="Select" />
            </View>
          </View>
          <View className="mb-4">
            <ThemedText type="label" className="-mt-4">
              Date End
            </ThemedText>
            <View className="flex flex-row items-center justify-between">
              <ThemedText>
                {form.end ? formatDate(form.end, true, true) : "Select date"}
              </ThemedText>
              <CustomButton onPress={showDateEnd} text="Select" />
            </View>
          </View>
          <DatePicker
            isVisible={dateStartOpen}
            mode="datetime"
            onConfirm={onSelectStart}
            onCancel={hideDateStart}
          />
          <DatePicker
            isVisible={dateEndOpen}
            mode="datetime"
            onConfirm={onSelectEnd}
            onCancel={hideDateEnd}
          />
          <View className="mb-4">
            <View className="h-[1px] bg-neutral-300 my-4" />
            <ThemedText type="label" className="text-neutral-700">
              Terms & Conditions
            </ThemedText>
            {TERMS_CONDITIONS.map((item, index) => (
              <View className="flex flex-row space-x-2 w-full">
                <ThemedText type="default" className="text-neutral-700">
                  {index + 1}.{" "}
                </ThemedText>
                <ThemedText
                  type="default"
                  className="text-neutral-700 max-w-[90%]"
                >
                  {item}
                </ThemedText>
              </View>
            ))}
          </View>
          <CustomButton loading={loading} onPress={handle} text="Create" />
        </View>
      </ScrollView>
      <Toast />
    </View>
  );
};

interface CreateAuctionDTO {
  name: string;
  description: string;
  location: string;
  openingPrice: string;
  buyNowPrice: string;
  minimumBid: string;
  start: string;
  end: string;
  category: string;
}

const initCreateAuctionDTO: CreateAuctionDTO = {
  name: "",
  description: "",
  location: "",
  openingPrice: "",
  buyNowPrice: "",
  minimumBid: "",
  start: "",
  end: "",
  category: "Tops",
};

const useCreateAuction = () => {
  const [form, setForm] = useState<CreateAuctionDTO>(initCreateAuctionDTO);
  const [loading, setLoading] = useState(false);
  const [dateStartOpen, setDateStartOpen] = useState(false);
  const [dateEndOpen, setDateEndOpen] = useState(false);

  const showDateStart = () => {
    setDateStartOpen(true);
  };

  const hideDateStart = () => {
    setDateStartOpen(false);
  };

  const showDateEnd = () => {
    setDateEndOpen(true);
  };

  const hideDateEnd = () => {
    setDateEndOpen(false);
  };

  const onSelectStart = (date: Date) => {
    onChange("start", date.toISOString());
    hideDateStart();
  };

  const onSelectEnd = (date: Date) => {
    onChange("end", date.toISOString());
    hideDateEnd();
  };

  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const categories = [
    "Tops",
    "Bottoms",
    "Footwear",
    "Accessories",
    "Outerwear",
  ];

  const onChange = (key: keyof CreateAuctionDTO, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handle = async () => {
    try {
      Object.values(form).forEach((value) => {
        if (!value) {
          throw new Error("Fill in all fields");
        }
      });
      if (
        isNaN(Number(form.buyNowPrice)) ||
        isNaN(Number(form.minimumBid)) ||
        isNaN(Number(form.openingPrice))
      ) {
        throw new Error("Invalid amount");
      }
      if (Number(form.buyNowPrice) < Number(form.openingPrice)) {
        throw new Error("Buy now price must be greater than opening price");
      }
      if (Number(form.minimumBid) < 10000) {
        throw new Error("Minimum increment bid is 10,000");
      }
      if (images.length === 0) {
        throw new Error("Upload at least one image");
      }
      if (new Date(form.start) > new Date(form.end)) {
        throw new Error("End date must be greater than start date");
      }
      if (new Date() > new Date(form.start)) {
        throw new Error("Start date must be greater than current date");
      }
      if (loading) return;
      setLoading(true);
      toastLoading();
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("location", form.location);
      formData.append("openingPrice", form.openingPrice);
      formData.append("buyNowPrice", form.buyNowPrice);
      formData.append("minimumBid", form.minimumBid);
      form.start && formData.append("start", form.start?.toString());
      form.end && formData.append("end", form.end?.toString());
      formData.append("category", form.category);

      const imagePaths = [];

      for (const image of images) {
        const compressed = await compressImage(image.uri);

        const fileUri = `${
          FileSystem.documentDirectory
        }imageTracking_${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: compressed.uri, to: fileUri });

        imagePaths.push(fileUri);
        formData.append("images", {
          uri: fileUri,
          name: "auction.jpg",
          type: "image/jpeg",
        } as any);
      }

      const res = await api.post<Api<Auction>>("/auctions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toastSuccess(res?.data?.message);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.back();
    } catch (error) {
      console.log(error);
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  const onOpenImage = async () => {
    showPickerOptions(
      {
        onImageSelected: (image) => {
          if (image) {
            setImages([...images, image]);
          }
        },
      },
      {
        camera: true,
        gallery: true,
      }
    );
  };

  const onDeleteImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return {
    form,
    onChange,
    handle,
    loading,
    categories,
    dateStartOpen,
    dateEndOpen,
    showDateStart,
    showDateEnd,
    hideDateStart,
    hideDateEnd,
    onSelectStart,
    onSelectEnd,
    images,
    onOpenImage,
    onDeleteImage,
  };
};

const TERMS_CONDITIONS = [
  "Auction will be requested in advance and wait until approved by admin",
  "Sellers are not charged additional fees by the admin",
  "Buyers will be charged 5% for admin fee payment",
  "Minimun increment bid is 10,000",
  "Items auctioned must be original goods",
  "Items must be described according to their original condition",
  "Photos should be clear for each side",
];

const styles = StyleSheet.create({
  buttonDropdown: {
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
});

export default CreateAuctionScreen;
