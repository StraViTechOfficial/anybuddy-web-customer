import { BASE_API_URL, TOKEN_NAME, TOKEN_NAME_REG } from "@/Until";
import axios from "axios";
import Cookies from "@/Until/cookies";
import { toast } from "react-toastify";
var querystring = require("querystring");

const handleApiError = (error) => {
  // console.log(error.response, "error.response");
  if (error.response?.data?.message === "Invalid Token") {
    window.location.href = "/";
    Cookies.remove(TOKEN_NAME); // Remove the token
    // toast.error("Session expired or server error. Please log in again.");
  }
  return error.response?.data || error.message || "An error occurred.";
};

export const postFormDataNoToken = async (url = "", data = {}) => {
  try {
    const formData = new FormData();

    for (let key in data) {
      formData.append(key, data[key]);
    }
    const response = await axios.post(BASE_API_URL + url, formData);

    return response.data;
  } catch (error) {
    // toast.error(error.message);
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};
export const postFormData = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const formData = new FormData();

    for (let key in data) {
      formData.append(key, data[key]);
    }
    const response = await axios.post(BASE_API_URL + url, formData, {
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    // toast.error(error.message);
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};
export const patchFormData = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const formData = new URLSearchParams();

    for (let key in data) {
      formData.append(key, data[key]);
    }
    const response = await axios.patch(BASE_API_URL + url, formData, {
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    // toast.error(error.message);
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};
export const patchRawData = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.patch(BASE_API_URL + url, data, {
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
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
    // toast.error(error.message);
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};
export const postRawDataforURL = async (url = "", id, data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.post(BASE_API_URL + url + `/${id}`, data, {
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    // toast.error(error.message);
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const getDataNoToken = async (url = "", data = {}) => {
  try {
    const response = await axios.get(BASE_API_URL + url, {
      params: data,
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const getDataforUrl = async (url = "", data = "") => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.get(BASE_API_URL + url + `/${data?.id}`, {
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const getDataforUrlParams = async (url, id, prams) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.get(BASE_API_URL + url + `/${id}`, {
      params: prams,
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const patchRawDataWithURLMulti = async (url, data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.patch(BASE_API_URL + url, data, {
      headers: {
        authtoken: token,
      },
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
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
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const getDataStringify = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.get(BASE_API_URL + url, {
      params: data,

      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const postDataURLIncoded = async (url = "", data = {}) => {
  try {
    //const token = await Cookies.get(TOKEN_NAME);
    //const tokenReg = await Cookies.get(TOKEN_NAME_REG);
    const formData = new URLSearchParams();
    for (let key in data) {
      formData.append(key, data[key]);
    }
    //console.log(data);
    const response = await axios.post(
      BASE_API_URL + url,
      querystring.stringify(data),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    //console.log(response);
    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const postDataURLIncodedWithToken = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);
    const formData = new URLSearchParams();
    for (let key in data) {
      formData.append(key, data[key]);
    }

    const response = await axios.post(
      BASE_API_URL + url,
      querystring.stringify(data),
      {
        headers: {
          authtoken: tokenReg ? tokenReg : token ? token : "",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    //console.log(response);
    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const patchDataURLIncoded = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);
    const formData = new URLSearchParams();
    for (let key in data) {
      formData.append(key, data[key]);
    }
    //console.log(data);
    const response = await axios.patch(
      BASE_API_URL + url,
      querystring.stringify(data),
      {
        headers: {
          authtoken: tokenReg ? tokenReg : token ? token : "",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    //console.log(response);
    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const patchforUrl = async (url = "", data = "") => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.patch(
      BASE_API_URL + url + `/${data?.id}`,
      null,
      {
        headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
      },
    );

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const putFormData = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);
    const formData = new FormData();

    for (let key in data) {
      formData.append(key, data[key]);
    }
    const response = await axios.put(BASE_API_URL + url, formData, {
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const putFormDataURLIncoded = async (url = "", data = {}) => {
  try {
    const formData = new FormData();

    for (let key in data) {
      formData.append(key, data[key]);
    }
    const response = await axios.put(
      BASE_API_URL + url,
      querystring.stringify(data),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};
export const putFormDataURLIncodedWithToken = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);
    const formData = new FormData();

    for (let key in data) {
      formData.append(key, data[key]);
    }
    const response = await axios.put(
      BASE_API_URL + url,
      querystring.stringify(data),
      {
        headers: {
          authtoken: tokenReg ? tokenReg : token ? token : "",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
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
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const putRawDataForURL = async (url = "", id, data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.put(BASE_API_URL + url + `/${id}`, data, {
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const putData = async (url = "", data = {}) => {
  try {
    const token = Cookies.get(TOKEN_NAME);

    const response = await axios.put(
      BASE_API_URL + url,
      "", // 👈 body data yaha jayega (agar empty rakhna hai to {})
      {
        headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
        params: data, // 👈 ye query string me jayega
      },
    );

    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || error?.message);
  }
};

export const deleteDataURLIncodedWithToken = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);
    // const formData = new FormData();

    // for (let key in data) {
    //   formData.append(key, data[key]);
    // }
    const response = await axios.delete(
      BASE_API_URL + url,

      {
        headers: {
          authtoken: tokenReg ? tokenReg : token ? token : "",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: querystring.stringify(data),
      },
    );

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};
export const deleteData = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);
    const formData = new FormData();

    for (let key in data) {
      formData.append(key, data[key]);
    }
    const response = await axios.delete(BASE_API_URL + url, {
      headers: {
        authtoken: tokenReg ? tokenReg : token ? token : "",
      },
      data: formData,
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const deleteforUrl = async (url = "", data = "") => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.delete(BASE_API_URL + url + `/${data?.id}`, {
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const DeleteParams = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.delete(BASE_API_URL + url, {
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
      params: data,
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const DeleteRow = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios.delete(BASE_API_URL + url, {
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
      data: data,
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const getDataAndDownload = async (url = "", data = {}) => {
  try {
    const token = await Cookies.get(TOKEN_NAME);
    const tokenReg = await Cookies.get(TOKEN_NAME_REG);

    const response = await axios({
      url: BASE_API_URL + url, //your url
      method: "GET",
      responseType: "blob", // important
      params: data,
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
    });

    return response.data;
  } catch (error) {
    // toast.error(error.response.data);
    return handleApiError(error);
  }
};

export const downloadPDF = async (url = "", data = {}) => {
  const token = await Cookies.get(TOKEN_NAME);
  const tokenReg = await Cookies.get(TOKEN_NAME_REG);
  try {
    // Make the API request to get the PDF
    const response = await axios.get(BASE_API_URL + url, {
      params: data,
      headers: { authtoken: tokenReg ? tokenReg : token ? token : "" },
      responseType: "arraybuffer", // Important to handle binary data
    });

    return response;
  } catch (error) {
    // console.error("Error downloading PDF:", error);
    return handleApiError(error);
  }
};
