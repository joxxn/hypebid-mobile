import { ThemedText } from "@/components/ThemedText";
import { Img } from "@/components/ui/Img";
import api from "@/config/api";
import { useProfile } from "@/hooks/useProfile";
import { Auction } from "@/models/Auction";
import { Bid } from "@/models/Bid";
import { Api } from "@/models/Response";
import { Transaction } from "@/models/Transaction";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingScreen = () => {
  const { bids, loading, sells, transactions, fetchData } = useSetting();
  const { profile, signOut } = useProfile();

  const MENU: MenuProps[] = [
    {
      title: "Profile",
      desc: "Edit your profile",
      icon: <Ionicons name="person-outline" size={24} />,
      onClick: () => router.push("/profile"),
    },
    {
      title: "Seller Mode",
      desc: "Sell your items and withdraw your money",
      icon: <Ionicons name="cart-outline" size={24} />,
      onClick: () => router.push("/sell"),
    },
    {
      title: "Password",
      desc: "Change your password",
      icon: <Ionicons name="lock-closed-outline" size={24} />,
      onClick: () => router.push("/change-password"),
    },
    {
      title: "Logout",
      desc: "Logout from the app",
      icon: <Ionicons name="log-out-outline" size={24} />,
      onClick: signOut,
    },
  ];
  return (
    <SafeAreaView>
      <RefreshControl refreshing={loading} onRefresh={fetchData}>
        <View className="w-full h-48 flex flex-col items-center justify-center overflow-hidden relative">
          <Image
            className="w-full h-full object-cover absolute top-0 left-0"
            source={require("@/assets/images/bg.jpg")}
          />
          <View className="w-full h-full absolute top-0 left-0 bg-black opacity-50" />
          <Img
            type="profile"
            className="w-16 h-16 rounded-full z-10"
            uri={profile.image}
          />
          <ThemedText type="sectionTitle" className="text-white mt-2">
            {profile.name}
          </ThemedText>
          <View className="flex flex-row w-full justify-evenly mt-2">
            <View className="flex flex-col items-center w-[30%]">
              <ThemedText className="text-white" type="sectionTitle">
                {bids}
              </ThemedText>
              <ThemedText className="text-white">Bids</ThemedText>
            </View>
            <View className="flex flex-col items-center w-[30%]">
              <ThemedText className="text-white" type="sectionTitle">
                {transactions}
              </ThemedText>
              <ThemedText className="text-white">Transactions</ThemedText>
            </View>
            <View className="flex flex-col items-center w-[30%]">
              <ThemedText className="text-white" type="sectionTitle">
                {sells}
              </ThemedText>
              <ThemedText className="text-white">Sells</ThemedText>
            </View>
          </View>
        </View>
        <View className="px-4 flex flex-col w-full mt-8">
          <FlatList
            data={MENU}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="w-full px-4 py-2 border border-neutral-200 flex flex-row items-center rounded-lg bg-white h-16 mb-2"
                onPress={item.onClick}
              >
                <View className="w-10 h-10 rounded-lg flex items-center justify-center border border-neutral-200">
                  {item.icon}
                </View>
                <View className="flex flex-col ml-4">
                  <ThemedText type="label">{item.title}</ThemedText>
                  <ThemedText type="default" className="text-sm">
                    {item.desc}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </RefreshControl>
    </SafeAreaView>
  );
};

interface MenuProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const useSetting = () => {
  const [loading, setLoading] = useState(false);
  const [bids, setBids] = useState<number>(0);
  const [transactions, setTransactions] = useState<number>(0);
  const [sells, setSells] = useState<number>(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resBid, resTransaction, resSell] = await Promise.all([
        api.get<Api<Bid[]>>(`/bids`),
        api.get<Api<Transaction[]>>(`/transactions`),
        api.get<Api<Auction[]>>(`/auctions/owned`),
      ]);

      setBids(resBid.data.data.length);
      setTransactions(resTransaction.data.data.length);
      setSells(resSell.data.data.length);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );
  return {
    bids,
    transactions,
    sells,
    loading,
    fetchData,
  };
};

export default SettingScreen;
