import { ThemedText } from "@/components/ThemedText";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomInputText } from "@/components/ui/CustomInputText";
import api from "@/config/api";
import { ACCESS_TOKEN } from "@/constants/AsyncStorage";
import { toastError, toastLoading, toastSuccess } from "@/helper/toast";
import { useProfile } from "@/hooks/useProfile";
import { Api } from "@/models/Response";
import { User } from "@/models/User";
import { Withdraw } from "@/models/Withdraw";
import formatRupiah from "@/utils/formatRupiah";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import Toast from "react-native-toast-message";

const RequestWithdrawPage = () => {
  const { handle, form, loading, onChange } = useWithdraw();
  const { profile } = useProfile();
  return (
    <View className="flex-1 flex flex-col space-y-4 px-4 py-8">
      <View>
        <ThemedText type="subtitle">Withdraw Funds</ThemedText>
        <ThemedText type="defaultSemiBold" className="text-neutral-700">
          Request a withdrawal to transfer funds to your bank account
        </ThemedText>
        <View className="h-[1px] bg-neutral-300 my-4" />
        <ThemedText type="defaultSemiBold" className="text-neutral-700">
          Available Balance: {formatRupiah(profile.balance)}
        </ThemedText>
        <ThemedText type="defaultSemiBold" className="text-neutral-700">
          Minimum Withdrawal: {formatRupiah(50000)}
        </ThemedText>
      </View>
      <View className="space-y-4">
        <View className="mt-4">
          <ThemedText type="label" className="mb-2 -mt-4">
            Bank
          </ThemedText>
          <SelectDropdown
            data={BANKS}
            onSelect={(selectedItem: string) => {
              onChange("bank", selectedItem);
            }}
            renderButton={(selectedItem: string, isOpened) => {
              return (
                <View style={styles.buttonDropdown}>
                  <ThemedText
                    type="default"
                    className={`${form.bank ? "text-black" : "text-[#a3a3a3]"}`}
                  >
                    {form.bank || "Select bank"}
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
                  {index < BANKS.length - 1 && (
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
            search
            searchInputStyle={{
              borderRadius: 10,
              backgroundColor: "#fff",
              padding: 10,
            }}
            searchPlaceHolder="Search bank..."
            searchInputTxtStyle={{ fontFamily: "Outfit-Regular" }}            
          />
        </View>
        <CustomInputText
          label="Account"
          value={form.account}
          onChangeText={(value) => onChange("account", value)}
          placeholder="8274xxxx"
          keyboardType="numeric"
        />
        <CustomInputText
          label="Amount"
          value={form.amount}
          onChangeText={(value) => onChange("amount", value)}
          keyboardType="numeric"
          placeholder="100000"
        />
        <CustomButton loading={loading} onPress={handle} text="Request" />
      </View>
      <Toast />
    </View>
  );
};

interface WithdrawDTO {
  amount: string;
  account: string;
  bank: string;
}

const initWithdrawDTO: WithdrawDTO = {
  account: "",
  amount: "",
  bank: "",
};

const useWithdraw = () => {
  const [form, setForm] = useState<WithdrawDTO>(initWithdrawDTO);
  const [loading, setLoading] = useState(false);
  const { profile, refetch: refetchProfile } = useProfile();

  const onChange = (key: keyof WithdrawDTO, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handle = async () => {
    try {
      Object.values(form).forEach((value) => {
        if (value === "") {
          throw new Error("Fill in all fields");
        }
      });
      if (isNaN(Number(form.amount))) {
        throw new Error("Invalid amount");
      }
      if (Number(form.amount) > profile?.balance) {
        throw new Error("Insufficient balance");
      }
      if (Number(form.amount) < 50000) {
        throw new Error("Minimum withdrawal is 50,000");
      }
      if (loading) return;
      setLoading(true);
      toastLoading();
      const res = await api.post<Api<Withdraw>>("/withdraws", {
        ...form,
        amount: Number(form.amount),
      });
      await refetchProfile();
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

  return { form, onChange, handle, loading };
};

export default RequestWithdrawPage;

const BANKS = [
  "BCA",
  "Mandiri",
  "BRI",
  "BNI",
  "CIMB Niaga",
  "Bank Danamon",
  "Bank Permata",
  "Bank Sinarmas",
  "Bank Mega",
  "Bank OCBC NISP",
  "Bank Jago",
  "Bank BTN",
  "Dana",
  "OVO",
  "LinkAja",
  "GoPay",
  "ShopeePay",
  "TrueMoney",
  "PayPal",
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
