import { AxiosError } from "axios";
import Toast from "react-native-toast-message";

export const toastSuccess = (message?: unknown) => {
  let msg = "";
  if (typeof message === "string") {
    msg = message;
  }

  if (typeof message === "object" && message !== null) {
    const messageObj = message as { message?: string };
    if (typeof messageObj?.message === "string") {
      msg = messageObj?.message;
    }
  }
  Toast.show({
    type: "success",
    text1: "Successfull",
    text2: msg || "Success",
  });
};

export const toastError = (message?: unknown) => {
  let msg = "";
  if (typeof message === "string") {
    msg = message;
  } else if (message instanceof AxiosError) {
    msg = message.response?.data?.message;
  } else if (message instanceof Error) {
    msg = message.message;
  }

  Toast.show({
    type: "error",
    text1: "Error",
    text2: msg || "Something went wrong",
  });
};

export const toastFill = () =>
  Toast.show({
    type: "error",
    text1: "Complete data",
    text2: "Fill in all fields",
  });

export const toastLoading = () => {
  Toast.show({
    type: "info",
    text1: "Loading..",
    text2: "Please wait",
  });
};
