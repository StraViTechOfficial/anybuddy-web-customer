import { BASE_API_URL, TOKEN_NAME, TOKEN_NAME_REG } from "@/Until";
import axios from "axios";
import Cookies from "@/Until/cookies";

const handleApiError = (error) => {
  if (error.response?.data?.message === "Invalid Token") {
    window.location.href = "/";
    Cookies.remove(TOKEN_NAME);
  }
  return error.response?.data || error.message || "An error occurred.";
};

export const postRawData = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.post(BASE_API_URL + url, data, {
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getData = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.get(BASE_API_URL + url, {
      params: data,
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const putRawData = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.put(BASE_API_URL + url, data, {
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
