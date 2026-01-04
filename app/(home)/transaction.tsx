import { ThemedText } from "@/components/ThemedText";
import { Img } from "@/components/ui/Img";
import api from "@/config/api";
import { Api } from "@/models/Response";
import { Transaction } from "@/models/Transaction";
import formatRupiah from "@/utils/formatRupiah";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TransactionScreen = () => {
  const {
    segments,
    onClickSegment,
    selectedItems,
    selectedSegment,
    getStatusColor,
    loading,
    fetchTransaction,
  } = useTransactions();
  return (
    <SafeAreaView>
      <ThemedText type="title" className="line-clamp-1 py-4 px-4">
        Transaction
      </ThemedText>
      <RefreshControl
        refreshing={loading}
        onRefresh={fetchTransaction}
        className="space-y-4"
      >
        <View className="space-y-2">
          <FlatList
            data={segments}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              padding: 4,
              marginHorizontal: 16,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`px-2 py-1 rounded-lg mr-2 ${
                  item.name === selectedSegment ? "bg-custom-1" : "bg-custom-2"
                }`}
                onPress={() => onClickSegment(item.name)}
              >
                <ThemedText className="text-white" type="defaultSemiBold">
                  {item.name}
                </ThemedText>
              </TouchableOpacity>
            )}
          />
          <View className="px-4">
            <FlatList
              data={selectedItems}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="w-full bg-white rounded-lg px-4 py-2 h-20 flex flex-row overflow-hidden mb-2 space-x-2"
                  onPress={() =>
                    router.push({
                      pathname: "/detail-transaction",
                      params: {
                        id: item.id,
                      },
                    })
                  }
                >
                  <Img
                    uri={item.auction?.images?.[0]}
                    className="w-16 h-16 aspect-square object-cover rounded-lg"
                  />
                  <View className="flex flex-col h-full">
                    <ThemedText
                      className="max-w-[200px]"
                      type="defaultSemiBold"
                    >
                      {item.auction?.name}
                    </ThemedText>
                    <ThemedText
                      className="max-w-[200px] text-xs"
                      type="default"
                    >
                      {formatRupiah(item.amount)}
                    </ThemedText>
                    <View
                      className={`px-2 py-1 bg-custom-1 rounded-lg w-20 items-center mt-auto ${getStatusColor(
                        item.status
                      )}`}
                    >
                      <ThemedText className={`text-xs text-white`}>
                        {item.status}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
            {!loading && selectedItems.length === 0 && (
              <View className="w-full items-center justify-center h-40">
                <ThemedText type="default" className="text-neutral-400">
                  No Transaction
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </RefreshControl>
    </SafeAreaView>
  );
};

interface SegmentedTransaction {
  name: string;
  items: Transaction[];
}

type Status =
  | "All"
  | "Pending"
  | "Expired"
  | "Paid"
  | "Delivered"
  | "Completed";

const useTransactions = () => {
  const status = [
    "All",
    "Pending",
    "Expired",
    "Paid",
    "Delivered",
    "Completed",
  ];

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Pending":
        return "bg-gray-400";
      case "Expired":
        return "bg-red-400";
      case "Paid":
        return "bg-blue-400";
      case "Delivered":
        return "bg-green-400";
      case "Completed":
        return "bg-black";
      default:
        return "bg-custom-1";
    }
  };

  const statusSegment: SegmentedTransaction[] = status.map((item) => ({
    name: item,
    items: [],
  }));

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [segments, setSegments] = useState<SegmentedTransaction[]>(
    status.map((item) => ({ name: item, items: [] }))
  );

  const [selectedSegment, setSelectedSegment] = useState<string>("All");

  const onClickSegment = (name: string) => {
    setSelectedSegment(name);
  };

  const selectedItems =
    selectedSegment === "All"
      ? transactions
      : segments.find((segment) => segment.name === selectedSegment)?.items ||
        [];

  const fetchTransaction = async () => {
    setLoading(true);
    const res = await api.get<Api<Transaction[]>>("/transactions");
    setTransactions(res.data.data);
    const newSegments: SegmentedTransaction[] = statusSegment.map(
      (segment) => ({
        name: segment.name,
        items: [],
      })
    );

    for (const transaction of res.data.data) {
      const segment = newSegments.find((s) => s.name === transaction.status);
      if (segment) {
        segment.items.push(transaction);
      }
    }

    setSegments([...newSegments]);

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransaction();
    }, [])
  );

  return {
    transactions,
    segments,
    onClickSegment,
    selectedItems,
    selectedSegment,
    loading,
    fetchTransaction,
    status,
    getStatusColor,
  };
};

export default TransactionScreen;
