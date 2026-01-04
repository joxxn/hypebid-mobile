import api from "@/config/api";
import { USER } from "@/constants/AsyncStorage";
import { toastSuccess } from "@/helper/toast";
import { Api } from "@/models/Response";
import { User } from "@/models/User";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

interface Profile {
  name: string;
  email: string;
  phone: string;
  image: string | null;
  balance: number;
  disburbedBalance: number;
  pendingBalance: number;
}

const initProfile: Profile = {
  name: "Loading...",
  email: "Loading...",
  phone: "Loading...",
  image: null,
  balance: 0,
  disburbedBalance: 0,
  pendingBalance: 0,
};

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile>(initProfile);

  const fetchData = async () => {
    try {
      const user = await AsyncStorage.getItem(USER);
      if (user) {
        setProfile(JSON.parse(user));
        return JSON.parse(user) as Profile;
      } else {
        const r = await refetch();
        return r as Profile;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateProfile = async (profile: Profile) => {
    try {
      await AsyncStorage.setItem(USER, JSON.stringify(profile));
      setProfile(profile);
    } catch (error) {
      console.log(error);
    }
  };

  const refetch = async () => {
    const res = await api.get<Api<User>>("/account");
    await updateProfile(res.data.data);
    setProfile(res.data.data);
    return res.data.data;
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const signOut = async () => {
    try {
      await AsyncStorage.clear();
      setProfile(initProfile);
      toastSuccess("Sign out successfully");
      router.replace("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return { profile, updateProfile, signOut, fetchData, refetch };
};
