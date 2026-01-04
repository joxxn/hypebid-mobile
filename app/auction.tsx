import { ThemedText } from "@/components/ThemedText";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomInputText } from "@/components/ui/CustomInputText";
import { Img } from "@/components/ui/Img";
import api from "@/config/api";
import { C } from "@/constants/Colors";
import { toastError, toastSuccess } from "@/helper/toast";
import { Auction } from "@/models/Auction";
import { Bid } from "@/models/Bid";
import { Api } from "@/models/Response";
import { Transaction } from "@/models/Transaction";
import { Kyc, KycStatus } from "@/models/Kyc";
import formatDate from "@/utils/formatDate";
import formatRupiah from "@/utils/formatRupiah";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface KycStatusData {
  status: "none" | KycStatus;
  kyc: Kyc | null;
}

const KycRequiredBanner = ({
  kycData,
  onVerify,
}: {
  kycData: KycStatusData;
  onVerify: () => void;
}) => {
  const { status } = kycData;

  const getConfig = () => {
    switch (status) {
      case "Pending":
        return {
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          iconColor: "#B45309",
          icon: "time-outline" as const,
          title: "KYC Verification Pending",
          description:
            "Your identity verification is being reviewed. You can bid once verified.",
          showAction: false,
        };
      case "Rejected":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "#B91C1C",
          icon: "close-circle-outline" as const,
          title: "KYC Verification Rejected",
          description:
            "Your verification was rejected. Please submit a new KYC to participate in bidding.",
          showAction: true,
          actionLabel: "Retry Verification",
        };
      case "none":
      default:
        return {
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconColor: "#374151",
          icon: "shield-outline" as const,
          title: "KYC Required to Bid",
          description:
            "Verify your identity to participate in auctions. This helps ensure safe transactions.",
          showAction: true,
          actionLabel: "Verify Now",
        };
    }
  };

  const config = getConfig();

  return (
    <View
      className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 mb-4`}
    >
      <View className="flex-row items-start">
        <View className="mr-3 mt-0.5">
          <Ionicons name={config.icon} size={24} color={config.iconColor} />
        </View>
        <View className="flex-1">
          <ThemedText type="defaultSemiBold" className="text-gray-800 mb-1">
            {config.title}
          </ThemedText>
          <ThemedText type="default" className="text-gray-600 text-sm mb-3">
            {config.description}
          </ThemedText>
          {config.showAction && (
            <TouchableOpacity
              onPress={onVerify}
              className="bg-blue-600 rounded-lg py-2.5 px-4 self-start"
              activeOpacity={0.8}
            >
              <ThemedText type="defaultSemiBold" className="text-white text-sm">
                {config.actionLabel}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const AuctionPage = () => {
  const {
    data,
    getStatusTextAuction,
    bidding,
    fetchData,
    loading,
    buyNowBidding,
    quickBidding,
    amount,
    handleBidding,
    setAmount,
    customCase,
    kycData,
    isKycVerified,
  } = useAuction();

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={C[1]} />
      </View>
    );
  }

  const handleNavigateToKyc = () => {
    router.push("/kyc-verification");
  };

  // Check if user can bid (KYC must be Accepted)
  const canBid = data.isAbleToBid && isKycVerified;
  const showKycBanner =
    data.isAbleToBid && !isKycVerified && !data.isSeller;

  return (
    <SafeAreaView className="flex-1 ">
      <ScrollView
        className="z-10 "
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
      >
        <View>
          <View className="w-full h-60">
            {!data.images.length && (
              <Img className="w-[100vw] h-full object-cover" />
            )}
            <FlatList
              data={data.images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Img uri={item} className="w-[100vw] h-full object-cover" />
              )}
              horizontal
              pagingEnabled
            />
          </View>
          <View className="flex flex-col py-2 space-y-2 mt-2">
            <View className="px-4 flex flex-col space-y-2">
              <ThemedText className="text-3xl font-omedium text-black">
                {data.name}
              </ThemedText>
              <View className="flex flex-row items-center justify-between">
                <View className="px-2 py-1 bg-custom-1 rounded-lg flex items-center justify-center w-auto">
                  <ThemedText className="text-white font-omedium">
                    {data.category}
                  </ThemedText>
                </View>
                {/* <ThemedText
                  className={`text-${
                    getStatusTextAuction(data).color
                  } font-omedium`}
                >
                  {getStatusTextAuction(data).label}
                </ThemedText> */}
              </View>
              <ThemedText className="text-neutral-700">
                {data.description}
              </ThemedText>
              <View
                className="flex flex-row space-x-4 w-full h-auto px-2 py-2 rounded-lg bg-white items-center my-4"
                style={{ elevation: 4 }}
              >
                <Img
                  uri={data.seller.image}
                  className="w-12 h-12 rounded-full"
                  type="profile"
                />
                <View className="flex flex-col max-w-[70%]">
                  <ThemedText className="font-omedium text-black text-lg">
                    {data.seller.name}
                  </ThemedText>
                  <ThemedText className="text-xs text-neutral-600">
                    {data.location}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View className="flex flex-row justify-evenly my-4">
              <View
                className="flex flex-col items-center w-[45%] bg-white p-2 rounded-lg"
                style={{ elevation: 4 }}
              >
                <ThemedText className="text-sm">Start</ThemedText>
                <ThemedText className="text-md font-omedium text-neutral-700">
                  {formatDate(data.start, true)}
                </ThemedText>
                <ThemedText className="text-lg font-omedium text-neutral-700">
                  {formatDate(data.start, true, true, true)}
                </ThemedText>
              </View>
              <View
                className="flex flex-col items-center w-[45%] bg-custom-1 p-2 rounded-lg"
                style={{ elevation: 4 }}
              >
                <ThemedText className="text-white text-sm">Ends</ThemedText>
                <ThemedText className="text-md font-omedium text-white">
                  {formatDate(data.end, true)}
                </ThemedText>
                <ThemedText className="text-lg font-omedium text-white">
                  {formatDate(data.end, true, true, true)}
                </ThemedText>
              </View>
            </View>
            <View className="my-4 space-y-2 px-4">
              <ThemedText type="label" className="text-neutral-700">
                Bid Information
              </ThemedText>
              <View className="flex flex-row justify-evenly">
                <View className="flex flex-col items-center w-[45%]">
                  <ThemedText>Opening Price</ThemedText>
                  <View className="flex flex-row items-center space-x-2">
                    <ThemedText className="text-xl font-omedium text-neutral-700">
                      {formatRupiah(data.openingPrice)}
                    </ThemedText>
                  </View>
                </View>
                <View className="flex flex-col items-center w-[45%]">
                  <ThemedText>Buy Now</ThemedText>
                  <View className="flex flex-row items-center space-x-2">
                    <ThemedText className="text-xl font-omedium text-neutral-700">
                      {formatRupiah(data.buyNowPrice)}
                    </ThemedText>
                  </View>
                </View>
              </View>
              <View className="flex flex-row justify-evenly">
                <View className="flex flex-col items-center w-[45%]">
                  <ThemedText>Last Bid</ThemedText>
                  <View className="flex flex-row items-center space-x-2">
                    <ThemedText className="text-xl font-omedium text-neutral-700">
                      {formatRupiah(
                        data.bids?.[0]?.amount || data.openingPrice
                      )}
                    </ThemedText>
                  </View>
                </View>
                <View className="flex flex-col items-center w-[45%]">
                  <ThemedText>Increment Bid</ThemedText>
                  <View className="flex flex-row items-center space-x-2">
                    <ThemedText className="text-xl font-omedium text-neutral-700">
                      {formatRupiah(data.minimumBid)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
            <View className="mb-4 px-4">
              <View className="h-[1px] bg-neutral-300 my-4" />
              <ThemedText type="label" className="text-neutral-700">
                Terms & Conditions
              </ThemedText>
              {TERMS_CONDITIONS.map((item, index) => (
                <View className="flex flex-row space-x-2 w-full" key={index}>
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
            <View className="my-4 space-y-2">
              <ThemedText type="label" className="text-neutral-700 px-4">
                Bids
              </ThemedText>
              <FlatList
                data={data.bids}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                renderItem={({ item }) => (
                  <View
                    className="w-full bg-white rounded-lg px-4 py-2 h-20 flex flex-row overflow-hidden mb-2 space-x-2 items-center"
                    style={{ elevation: 4 }}
                  >
                    <Img
                      uri={item.user.image}
                      className="w-16 h-16 aspect-square object-cover rounded-full"
                      type="profile"
                    />
                    <View className="flex flex-col">
                      <ThemedText
                        numberOfLines={1}
                        type="default"
                        className="text-sm text-neutral-700"
                      >
                        {item.user.name}
                      </ThemedText>
                      <ThemedText className="text-lg" type="defaultSemiBold">
                        {formatRupiah(item.amount)}
                      </ThemedText>
                      <ThemedText
                        className="text-xs text-neutral-700"
                        type="default"
                      >
                        {formatDate(item.createdAt, true, true)}
                      </ThemedText>
                    </View>
                  </View>
                )}
              />
              {!data.bids.length && (
                <View className="w-full items-center justify-center h-40">
                  <ThemedText type="default" className="text-neutral-400">
                    No Bids
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>
        <View className="h-20 w-full" />
      </ScrollView>
      <View
        className="w-full h-auto bg-white z-50 fixed bottom-0  flex flex-col px-4 rounded-t-3xl py-4 space-y-2"
        style={{ elevation: 4 }}
      >
        {/* KYC Required Banner - Show when user needs to verify */}
        {showKycBanner && (
          <KycRequiredBanner kycData={kycData} onVerify={handleNavigateToKyc} />
        )}

        {/* Bid controls - Only show when KYC is verified and can bid */}
        {canBid && (
          <View>
            <ThemedText type="label">Place Your Bid</ThemedText>
            <View className="w-full flex flex-row justify-between items-center mb-4">
              <CustomButton
                text={`Quick Bid ${formatRupiah(
                  data.minimumBid +
                  (data.bids?.[0]?.amount || data.openingPrice)
                )}`}
                cn="w-[48%] bg-white border border-custom-1 text-custom-1"
                cnText="font-omedium text-custom-1"
                loading={quickBidding}
                colorActivityIndicator={C[1]}
                onPress={() =>
                  handleBidding(
                    "Quick",
                    String(
                      data.minimumBid +
                      (data.bids?.[0]?.amount || data.openingPrice)
                    )
                  )
                }
              />
              <CustomButton
                text={`Buy Now ${formatRupiah(data.buyNowPrice)}`}
                cn="w-[48%]"
                cnText="font-omedium"
                loading={buyNowBidding}
                onPress={() =>
                  handleBidding("Buy Now", String(data.buyNowPrice))
                }
              />
            </View>
            <CustomInputText
              value={amount}
              onChangeText={(value) => setAmount(value)}
              placeholder="200"
              label="Bid Amount"
              keyboardType="numeric"
            />
          </View>
        )}

        <CustomButton
          text={customCase.label}
          cn={`w-auto ${customCase.bg}`}
          cnText="font-osemibold text-lg"
          loading={bidding}
          onPress={() => customCase?.void?.("Place Bid", amount)}
        />
      </View>
      <Toast />
    </SafeAreaView>
  );
};

export default AuctionPage;

type Bidding = "Quick" | "Buy Now" | "Place Bid";

const useAuction = () => {
  const [data, setData] = useState<Auction>();
  const [loading, setLoading] = useState(false);
  const [bidding, setBidding] = useState(false);
  const [quickBidding, setQuickBidding] = useState(false);
  const [buyNowBidding, setBuyNowBidding] = useState(false);
  const id = (useLocalSearchParams().id as string) || "";
  const [amount, setAmount] = useState<string>("0");
  const [kycData, setKycData] = useState<KycStatusData>({
    status: "none",
    kyc: null,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get<Api<Auction>>(`/auctions/${id}`);
      setData(res.data.data);
    } catch (error) {
      console.log(error);
      toastError(error);
      setTimeout(() => {
        router.back();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchKycStatus = async () => {
    try {
      const res = await api.get<Api<Kyc | null>>("/account/check-kyc");
      const kyc = res.data.data;

      if (kyc === null) {
        setKycData({ status: "none", kyc: null });
      } else {
        setKycData({ status: kyc.status, kyc });
      }
    } catch (error) {
      console.log("Error fetching KYC status:", error);
      setKycData({ status: "none", kyc: null });
    }
  };

  const isKycVerified = kycData.status === "Accepted";

  const getStatusTextAuction = (auction: Auction) => {
    if (auction.start > new Date()) {
      return { label: "Upcoming", color: "gray-400" };
    } else if (
      auction.end < new Date() ||
      auction?.bids?.[0]?.amount === auction.buyNowPrice ||
      auction?.transaction
    ) {
      return { label: "Finished", color: "black" };
    } else if (auction.start < new Date() && auction.end > new Date()) {
      return { label: "Ongoing", color: "blue-400" };
    }
    return { label: "", color: "gray-400" };
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      fetchKycStatus();
    }, [])
  );

  const isDisable = loading || bidding || quickBidding || buyNowBidding;

  const handleBidding = async (type: Bidding, dto: string = amount) => {
    try {
      // Check KYC status before allowing bid
      if (!isKycVerified) {
        toastError("Please complete KYC verification to bid");
        return;
      }

      if (isDisable || !data) return;
      if (type === "Quick") {
        setQuickBidding(true);
      } else if (type === "Buy Now") {
        setBuyNowBidding(true);
      } else {
        setBidding(true);
      }

      if (isNaN(Number(dto))) {
        throw new Error("Invalid amount");
      }

      if (
        Number(dto) <
        (data.bids?.[0]?.amount || data?.openingPrice) + data.minimumBid
      ) {
        throw new Error(
          `Minimum bid is ${formatRupiah(
            data.minimumBid + (data.bids?.[0]?.amount || data.openingPrice)
          )}`
        );
      }

      const res = await api.post<Api<Transaction>>(`/bids/${id}`, {
        amount: Number(dto),
      });
      await fetchData();
      toastSuccess(res?.data?.message);
      if (res?.data?.data?.id && res?.data?.data?.snapToken) {
        router.push({
          pathname: "/detail-transaction",
          params: {
            id: String(res.data.data?.id),
          },
        });
      }
    } catch (error) {
      console.log(error);
      toastError(error);
    } finally {
      setBidding(false);
      setQuickBidding(false);
      setBuyNowBidding(false);
    }
  };

  interface CustomCase {
    label: string;
    bg: string;
    void?: (type: Bidding, dto: string) => void;
  }

  const customCase: CustomCase = {
    label: "",
    bg: "bg-gray-400",
    void: () => { },
  };

  const handleFinish = async () => {
    try {
      if (loading || bidding) return;
      if (!data?.isAbleToFinish) return;
      setBidding(true);
      await api.patch<Api<Auction>>(`/auctions/${id}`);
      await fetchData();
      toastSuccess("Auction finished");
    } catch (error) {
      console.log(error);
      toastError(error);
    } finally {
      setBidding(false);
    }
  };

  if (data && new Date(data?.start) > new Date()) {
    customCase.label = "Upcoming";
    customCase.bg = "bg-gray-400";
    customCase.void = undefined;
  } else if (data?.isWaitingForSeller) {
    customCase.label = "Waiting for seller";
    customCase.bg = "bg-gray-400";
    customCase.void = undefined;
  } else if (data?.isSeller && data.transaction?.status === "Pending") {
    customCase.label = "Waiting for buyer payment";
    customCase.bg = "bg-black";
    customCase.void = undefined;
  } else if (data?.isSeller && !data.isAbleToFinish && !data.transaction) {
    customCase.label = "You are the seller";
    customCase.bg = "bg-black";
    customCase.void = undefined;
  } else if (data?.isSeller && data.isAbleToFinish && !data.transaction) {
    customCase.label = "Finish the auction";
    customCase.bg = "bg-green-400";
    customCase.void = handleFinish;
    // SOME FUNCTION TO FINISH THE AUCTION
  } else if (
    data?.isBuyer &&
    data.transaction &&
    data.transaction.status === "Pending"
  ) {
    customCase.label = "Proceed to payment";
    customCase.bg = "bg-green-400";
    customCase.void = () =>
      router.push({
        pathname: "/detail-transaction",
        params: {
          id: data?.transaction?.id,
        },
      });
  } else if (data?.isBuyer || data?.isSeller) {
    customCase.label = "Check transaction";
    customCase.bg = "bg-green-400";
    customCase.void = () =>
      router.push({
        pathname: "/detail-transaction",
        params: {
          id: data?.transaction?.id,
        },
      });
  } else if (
    data &&
    (data.end < new Date() ||
      data?.bids?.[0]?.amount === data.buyNowPrice ||
      data?.transaction) &&
    !data.isBuyer &&
    !data.isSeller
  ) {
    customCase.label = "Finished";
    customCase.bg = "bg-black";
    customCase.void = undefined;
  } else if (
    !data?.isSeller &&
    !data?.transaction &&
    data?.isAbleToBid &&
    isKycVerified
  ) {
    // Only allow bidding if KYC is verified
    customCase.label = "Bid Now";
    customCase.bg = "bg-custom-1";
    customCase.void = (type, dto) => handleBidding(type, dto);
  } else if (
    !data?.isSeller &&
    !data?.transaction &&
    data?.isAbleToBid &&
    !isKycVerified
  ) {
    // KYC not verified - show verify button
    customCase.label = "Verify KYC to Bid";
    customCase.bg = "bg-blue-600";
    customCase.void = () => router.push("/kyc-verification");
  }

  console.log("STATUS  ", data?.isAbleToBid, data?.isAbleToFinish);

  return {
    data,
    getStatusTextAuction,
    loading,
    bidding,
    quickBidding,
    buyNowBidding,
    fetchData,
    amount,
    setAmount,
    handleBidding,
    customCase,
    kycData,
    isKycVerified,
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
