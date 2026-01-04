import { ThemedText } from "@/components/ThemedText";
import { Img } from "@/components/ui/Img";
import api from "@/config/api";
import { C } from "@/constants/Colors";
import { useProfile } from "@/hooks/useProfile";
import { Api } from "@/models/Response";
import { Withdraw } from "@/models/Withdraw";
import formatDate from "@/utils/formatDate";
import formatRupiah from "@/utils/formatRupiah";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WithdrawScreen = () => {
  const { loading, withdraws, fetchData, getColorStatus, setLoading } =
    useWithdraw();
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
                  onPress={() => router.push("/request-withdrawal")}
                >
                  <Ionicons name="document-text" size={18} color={C[1]} />
                  <ThemedText className="text-custom-1 text-sm" type="label">
                    Request Withdrawal
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View className="space-y-2 mt-8">
            <ThemedText className="px-4 text-neutral-700" type="subtitle">
              History
            </ThemedText>
            <View className="px-4">
              <FlatList
                data={withdraws}
                keyExtractor={(item, index) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="w-full bg-white rounded-lg px-4 py-2 h-20 flex flex-row overflow-hidden mb-2 space-x-2">
                    <View className="w-[20%] h-16 aspect-square rounded-lg flex items-center justify-center">
                      <Ionicons name="cash-outline" size={36} color={C[2]} />
                    </View>

                    <View className="flex flex-col h-full w-[80%] relative">
                      <View className="flex flex-col justify-evenly my-auto">
                        <ThemedText type="defaultSemiBold" className="text-lg">
                          {formatRupiah(item.amount)}
                        </ThemedText>
                        <ThemedText
                          className="max-w-[200px] text-xs"
                          type="default"
                        >
                          {item.bank} | {item.account}
                        </ThemedText>
                      </View>
                      <View className="flex flex-col justify-center absolute right-0 h-20 space-y-1 items-end">
                        <ThemedText
                          className="max-w-[200px] text-xs text-neutral-700"
                          type="defaultSemiBold"
                        >
                          {formatDate(item.createdAt, true, true)}
                        </ThemedText>
                        <View
                          className={`px-2 py-1 bg-custom-1 rounded-lg w-20 items-center ${getColorStatus(
                            item
                          )}`}
                        >
                          <ThemedText className={`text-xs text-white`}>
                            {item.status}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              />
            </View>
            {!loading && withdraws.length === 0 && (
              <View className="flex flex-col items-center justify-center mt-12 h-20">
                <Ionicons name="cart-outline" size={36} />
                <ThemedText className="text-neutral-700" type="defaultSemiBold">
                  You don&apos;t have withdrawal history
                </ThemedText>
              </View>
            )}
          </View>
        </RefreshControl>
      </ScrollView>
    </SafeAreaView>
  );
};

const useWithdraw = () => {
  const [loading, setLoading] = useState(false);
  const [withdraws, setWithdraws] = useState<Withdraw[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSell] = await Promise.all([
        api.get<Api<Withdraw[]>>(`/withdraws`),
      ]);

      setWithdraws(resSell.data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getColorStatus = (auction: Withdraw) => {
    if (auction.status === "Pending") {
      return "bg-yellow-400";
    } else {
      return "bg-green-400";
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return {
    withdraws,
    loading,
    fetchData,
    getColorStatus,
    setLoading,
  };
};

export default WithdrawScreen;
