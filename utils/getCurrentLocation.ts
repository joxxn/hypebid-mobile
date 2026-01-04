import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toastError } from "@/helper/toast";
import * as MediaLibrary from "expo-media-library";
import * as Camera from "expo-camera";
import Toast from "react-native-toast-message";
import { LOCATION_DATA } from "@/constants/AsyncStorage";

export const requestPermissions = async () => {
  try {
    const { status: cameraStatus } =
      await Camera.Camera.requestCameraPermissionsAsync();
    if (cameraStatus !== "granted") {
      toastError("Aplikasi memerlukan izin kamera untuk melanjutkan.");
    }

    const { status: mediaStatus } =
      await MediaLibrary.requestPermissionsAsync();
    if (mediaStatus !== "granted") {
      toastError(
        "Aplikasi memerlukan izin perpustakaan media untuk melanjutkan."
      );
    }

    const { status: locationStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== "granted") {
      toastError("Aplikasi memerlukan izin lokasi untuk melanjutkan.");
    }
  } catch (error) {
    console.error("Error while requesting permissions:", error);
  }
};

interface LocationData {
  currentLocation: Location.LocationObject;
  addressDetail: string[];
  location: Location.LocationGeocodedAddress;
}

export const getCurrentPosition = async (): Promise<LocationData | null> => {
  await requestPermissions();
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    toastError("Izin lokasi tidak diberikan");
    return null;
  }

  try {
    const currentLocation = await Location.getCurrentPositionAsync({});

    let addressDetail;
    let location;

    console.log({ navigator });

    const reversed = await Location.reverseGeocodeAsync(currentLocation.coords);
    if (reversed.length === 0) {
      throw new Error("Lokasi tidak ditemukan");
    }
    location = reversed[0];
    addressDetail = reversed.map((loc) => {
      const { subregion, region } = loc;

      return [subregion, region].filter(Boolean).join(", ");
    });

    const dataToSave = { currentLocation, addressDetail, location };
    await AsyncStorage.setItem(LOCATION_DATA, JSON.stringify(dataToSave));
    return dataToSave;
  } catch (error) {
    console.log("Error getting location:", error);
    const savedData = await AsyncStorage.getItem(LOCATION_DATA);
    if (savedData) {
      const parsedData: LocationData = JSON.parse(savedData);
      return parsedData;
    } else {
      toastError("Gagal mengambil lokasi dan tidak ada data cache");
      return null;
    }
  }
};
