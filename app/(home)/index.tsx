import { ThemedText } from "@/components/ThemedText";
import { Img } from "@/components/ui/Img";
import api from "@/config/api";
import { useProfile } from "@/hooks/useProfile";
import { Auction } from "@/models/Auction";
import { Api } from "@/models/Response";
import formatDate from "@/utils/formatDate";
import formatRupiah from "@/utils/formatRupiah";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  const { profile } = useProfile();
  const {
    segments,
    popularAuctions,
    onClickSegment,
    selectedItems,
    selectedSegment,
    loading,
    fetchAuctions,
  } = useHome();
  return (
    <SafeAreaView>
      <ScrollView
      
      refreshControl={<RefreshControl refreshing={loading}   onRefresh={()=>{
        fetchAuctions();
      }}/>}
      >
        <View className="flex flex-row items-center justify-between px-4">
          <View className="flex flex-col space-y-2 py-4 w-[85%] overflow-hidden">
            <ThemedText type="subtitle" className="text-neutral-700">
              Welcome Back
            </ThemedText>
            <ThemedText type="title" className="line-clamp-1">
              {profile.name}
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/setting")}
            className="w-[15%] h-auto aspect-square rounded-full"
          >
            <Img
              uri={profile.image}
              type="profile"
              className="w-full h-full aspect-square rounded-full"
            />
          </TouchableOpacity>
        </View>
        <View
        
          className="space-y-4"
        >
          <View className="space-y-2">
            <ThemedText className="px-4 text-neutral-700" type="subtitle">
              Popular Auctions
            </ThemedText>
            <FlatList
              data={popularAuctions}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                padding: 4,
                marginHorizontal: 16,
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="relative rounded-lg shadow-lg drop-shadow-lg overflow-hidden h-40 w-[80vw] bg-red-300 mr-4 flex flex-col justify-end"
                  onPress={() =>
                    router.push({
                      pathname: "/auction",
                      params: { id: item.id },
                    })
                  }
                >
                  <Img
                    uri={item.images[0]}
                    className="w-full h-full object-cover absolute top-0 left-0"
                  />
                  <View className="absolute bottom-0 left-0 right-0 flex flex-row justify-between items-center px-2 py-2 bg-black opacity-30 w-full h-full" />
                  <View className="flex flex-col z-10 bg-white px-4 py-2">
                    <ThemedText
                      type="subtitle"
                      className="text-black line-clamp-1"
                      numberOfLines={1}
                    >
                      {item.name}
                    </ThemedText>
                    <View className="flex flex-row items-center justify-between">
                      <ThemedText
                        type="label"
                        className="text-neutral-700 font-oregular"
                      >
                        {item.category}
                      </ThemedText>
                      <View className="flex flex-col justify-end items-end">
                        <ThemedText
                          type="label"
                          className="text-neutral-700 font-oregular text-xs"
                        >
                          Last Bid
                        </ThemedText>
                        <ThemedText
                          type="label"
                          className="text-neutral-700 font-oregular text-xs"
                        >
                          {formatRupiah(
                            item?.bids?.[0]?.amount || item.openingPrice
                          )}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          <View className="space-y-2">
            <ThemedText className="px-4 text-neutral-700" type="subtitle">
              Bid Now
            </ThemedText>
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
                    item.name === selectedSegment
                      ? "bg-custom-1"
                      : "bg-custom-2"
                  }`}
                  onPress={() => onClickSegment(item.name)}
                >
                  <ThemedText className="text-white" type="defaultSemiBold">
                    {item.name}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
            <View className="flex flex-row items-center justify-between px-4 flex-wrap w-full space-y-2">
              {selectedItems.map((item, index) => (
                <TouchableOpacity
                  className="w-[49%] h-52 rounded-lg overflow-hidden px-2 py-2 flex flex-col drop-shadow-lg border border-neutral-200 bg-white"
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
                  <View className="flex flex-col mt-2 justify-between h-16">
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
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface SegmentedAuction {
  name: string;
  items: Auction[];
}

const useHome = () => {
  const [loading, setLoading] = useState(true);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [segments, setSegments] = useState<SegmentedAuction[]>([
    { name: "All", items: [] },
  ]);
  const [selectedSegment, setSelectedSegment] = useState<string>("All");

  const onClickSegment = (name: string) => {
    setSelectedSegment(name);
  };

  const selectedItems =
    segments.find((segment) => segment.name === selectedSegment)?.items || [];

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const res = await api.get<Api<Auction[]>>("/auctions");
      setAuctions(res.data.data);
      const segments: SegmentedAuction[] = [];
      res.data.data.forEach((item) => {
        const index = segments.findIndex(
          (segment) => segment.name === item.category
        );
        if (index === -1) {
          segments.push({ name: item.category, items: [item] });
        } else {
          segments[index].items.push(item);
        }
      });
      for (const segment of segments) {
        segment.items.sort(
          (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
        );
      }
      setSegments([
        {
          name: "All",
          items: res.data.data.sort(
            (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
          ),
        },
        ...segments,
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const popularAuctions = auctions
    .sort((a, b) => b.bids.length - a.bids.length)
    .slice(0, 3);

  useFocusEffect(
    useCallback(() => {
      fetchAuctions();
    }, [])
  );

  return {
    auctions,
    segments,
    popularAuctions,
    onClickSegment,
    selectedItems,
    selectedSegment,
    loading,
    fetchAuctions,
  };
};

export default HomeScreen;
