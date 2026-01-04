import { ThemedText } from "@/components/ThemedText";
import { Img } from "@/components/ui/Img";
import api from "@/config/api";
import { Auction } from "@/models/Auction";
import { Bid } from "@/models/Bid";
import { Api } from "@/models/Response";
import formatDate from "@/utils/formatDate";
import formatRupiah from "@/utils/formatRupiah";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BidScreen = () => {
  const { bids, fetchBid, loading, getStatusTextAuction } = useBids();
  return (
    <SafeAreaView>
      <ThemedText type="title" className="line-clamp-1 py-4 px-4">
        History Bid
      </ThemedText>

      <FlatList
        data={bids}
        refreshing={loading}
        onRefresh={fetchBid}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <View className="w-full bg-white rounded-lg px-4 py-3 flex flex-row overflow-hidden mb-2 space-x-3 items-center">
            <Img
              uri={item.auction?.images?.[0]}
              className="w-16 h-16 aspect-square object-cover rounded-lg"
            />
            <View className="flex-1 flex flex-col justify-between py-1">
              <ThemedText className="line-clamp-1" type="defaultSemiBold" numberOfLines={1}>
                {item.auction?.name}
              </ThemedText>
              <ThemedText className="text-xs text-neutral-600" type="default">
                {formatRupiah(item.amount)} at{" "}
                {formatDate(item.createdAt, true, true)}
              </ThemedText>
              <View
                className={`px-2 py-1 rounded-lg w-20 items-center ${getStatusTextAuction(item.auction).color}`}
              >
                <ThemedText className="text-xs text-white">
                  {getStatusTextAuction(item.auction).label}
                </ThemedText>
              </View>
            </View>
          </View>
        )}
      />
      {!loading && bids.length === 0 && (
        <View className="w-full items-center justify-center h-40">
          <ThemedText type="default" className="text-neutral-400">
            No Data Found
          </ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
};

const useBids = () => {
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Bid[]>([]);

  const fetchBid = async () => {
    setLoading(true);
    const res = await api.get<Api<Bid[]>>("/bids");
    setBids(res.data.data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchBid()
    }, [])
  );

  const getStatusTextAuction = (auction: Auction) => {
    const now = new Date();
    const startDate = new Date(auction.start);
    const endDate = new Date(auction.end);

    if (startDate > now) {
      return { label: "Upcoming", color: "bg-gray-400" };
    } else if (
      endDate < now ||
      auction?.bids?.[0]?.amount === auction.buyNowPrice ||
      auction?.transaction
    ) {
      return { label: "Finished", color: "bg-black" };
    } else if (startDate < now && endDate > now) {
      return { label: "Ongoing", color: "bg-blue-400" };
    }
    return { label: "", color: "bg-gray-400" };
  };

  return {
    bids,
    loading,
    fetchBid,
    getStatusTextAuction,
  };
};

export default BidScreen;
