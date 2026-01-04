import { ThemedText } from "@/components/ThemedText";
import { Img } from "@/components/ui/Img";
import api from "@/config/api";
import { C } from "@/constants/Colors";
import { useProfile } from "@/hooks/useProfile";
import { Auction } from "@/models/Auction";
import { Api } from "@/models/Response";
import formatDate from "@/utils/formatDate";
import formatRupiah from "@/utils/formatRupiah";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SellScreen = () => {
  const { loading, auctions, fetchData, getColorStatus, setLoading } =
    useSell();
  const { profile, refetch: refetchProfile } = useProfile();

  const refetch = async () => {
    setLoading(true);
    await refetchProfile();
    await fetchData();
    setLoading(false);
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <RefreshControl refreshing={loading} onRefresh={refetch}>
          <View className="w-full h-52 flex flex-col overflow-hidden relative">
            <View className="w-full h-full absolute top-0 left-0 bg-custom-1" />
            <Image
              className="w-full h-full absolute top-0 left-0 z-10 opacity-25"
              source={require("@/assets/images/bg.jpg")}
            />
            <View className="w-full h-full px-4 py-4 z-20">
              <ThemedText className="text-white">Your Balance</ThemedText>
              <ThemedText
                type="sectionTitle"
                className="text-white text-3xl font-obold"
              >
                {formatRupiah(profile.balance)}
              </ThemedText>

              <View className="flex flex-row w-full mt-2">
                <View className="flex flex-col w-[45%]">
                  <ThemedText className="text-white" type="sectionTitle">
                    {formatRupiah(profile.pendingBalance)}
                  </ThemedText>
                  <ThemedText className="text-white">Pending</ThemedText>
                </View>
                <View className="flex flex-col w-[45%]">
                  <ThemedText className="text-white" type="sectionTitle">
                    {formatRupiah(profile.disburbedBalance)}
                  </ThemedText>
                  <ThemedText className="text-white">Disbursed</ThemedText>
                </View>
              </View>
              <View className="absolute bottom-4 right-4 flex flex-row items-center space-x-2 mb-2">
                <TouchableOpacity
                  className="px-2 py-1 border-2 border-white rounded-lg items-center justify-center bg-white flex flex-row space-x-1"
                  onPress={() => router.push("/withdraw")}
                >
                  <Ionicons name="cash-outline" size={18} color={C[1]} />
                  <ThemedText className="text-custom-1 text-sm" type="label">
                    Withdraw
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-2 py-1 border-2 border-white rounded-lg items-center justify-center bg-white flex flex-row space-x-1"
                  onPress={() => router.push("/create-auction")}
                >
                  <Ionicons name="add" size={18} color={C[1]} />
                  <ThemedText className="text-custom-1 text-sm" type="label">
                    Create Auction
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View className="space-y-2 mt-8">
            <ThemedText className="px-4 text-neutral-700" type="subtitle">
              Your Post
            </ThemedText>
            <View className="flex flex-row items-center justify-between px-4 flex-wrap w-full space-y-2">
              {auctions.map((item, index) => (
                <TouchableOpacity
                  className="w-[49%] h-56 rounded-lg overflow-hidden px-2 py-2 flex flex-col drop-shadow-lg border border-neutral-200 bg-white"
                  key={item.id + index}
                  onPress={() =>
                    router.push({
                      pathname: "/auction",
                      params: { id: item.id },
                    })
                  }
                >
                  <Img
                    uri={item.images[0]}
                    className="w-full h-28 object-cover rounded-lg"
                  />
                  <View className="flex flex-col mt-2 justify-between h-20">
                    <ThemedText
                      type="subtitle"
                      className="text-black line-clamp-1"
                      numberOfLines={1}
                    >
                      {item.name}
                    </ThemedText>
                    <View>
                      <ThemedText
                        type="label"
                        className="text-neutral-700 font-omedium text-xs"
                      >
                        {formatRupiah(
                          item?.bids?.[0]?.amount || item.openingPrice
                        )}
                      </ThemedText>
                      <ThemedText
                        type="label"
                        className="text-neutral-700 font-oregular text-xs"
                      >
                        End in {formatDate(item.end, true, true)}
                      </ThemedText>
                    </View>
                    <View
                      className={`${
                        getColorStatus(item).color
                      } px-2 py-1 rounded-lg w-20 flex items-center justify-center mt-auto`}
                    >
                      <ThemedText className="text-white text-xs">
                        {getColorStatus(item).label}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {!loading && auctions.length === 0 && (
              <View className="flex flex-col items-center justify-center mt-12 h-20">
                <Ionicons name="cart-outline" size={36} />
                <ThemedText className="text-neutral-700" type="defaultSemiBold">
                  You don&apos;t have any post yet
                </ThemedText>
              </View>
            )}
          </View>
        </RefreshControl>
      </ScrollView>
    </SafeAreaView>
  );
};

const useSell = () => {
  const [loading, setLoading] = useState(false);
  const [auctions, setAuctions] = useState<Auction[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSell] = await Promise.all([
        api.get<Api<Auction[]>>(`/auctions/owned`),
      ]);

      setAuctions(resSell.data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getColorStatus = (auction: Auction) => {
    if (auction.transaction?.status === "Paid") {
      return { label: "Paid", color: "bg-blue-400" };
    }
    if (auction.transaction?.status === "Pending") {
      return { label: "Waiting", color: "bg-sky-400" };
    }
    if (auction.transaction?.status === "Delivered") {
      return { label: "Delivered", color: "bg-purple-400" };
    }
    if (auction.transaction?.status === "Completed") {
      return { label: "Completed", color: "bg-green-400" };
    }
    if (auction.transaction?.status === "Expired") {
      return { label: "Expired", color: "bg-gray-400" };
    }

    if (auction.status === "Accepted") {
      return { label: "Accepted", color: "bg-black" };
    } else if (auction.status === "Pending") {
      return { label: "Pending", color: "bg-yellow-400" };
    } else if (auction.status === "Rejected") {
      return { label: "Rejected", color: "bg-red-400" };
    } else {
      return { label: "Check", color: "bg-gray-400" };
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return {
    auctions,
    loading,
    fetchData,
    getColorStatus,
    setLoading,
  };
};

export default SellScreen;
