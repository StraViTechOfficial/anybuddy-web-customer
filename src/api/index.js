import { BASE_API_URL } from "@/Until";
import axios from "axios";

// The calls go to this site's /api proxy, which adds the login token from its httpOnly cookie. The page never holds it.
const handleApiError = (error) => {
  if (error.response?.data?.message === "Invalid Token") {
    window.location.href = "/";
  }
  return error.response?.data || error.message || "An error occurred.";
};

export const postRawData = async (url = "", data = {}) => {
  try {
    const response = await axios.post(BASE_API_URL + url, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getData = async (url = "", data = {}) => {
  try {
    const response = await axios.get(BASE_API_URL + url, { params: data });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const putRawData = async (url = "", data = {}) => {
  try {
    const response = await axios.put(BASE_API_URL + url, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Forgets this browser's session (both login cookies) without ending the customer's sessions on other devices.
export const forgetSession = () => axios.delete(BASE_API_URL + "session").catch(() => null);
