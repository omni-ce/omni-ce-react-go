import axios from "axios";

import { HOST_API } from "@/environment";

const satellite = axios.create({
  baseURL: HOST_API,
  headers: {
    "Content-Type": "application/json",
  },
});

// request interceptor
satellite.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore parse errors
    }
    return config;
  },
  (error: Error) => {
    return Promise.reject(error);
  },
);

// response interceptor
satellite.interceptors.response.use(
  (response) => {
    // header: x-new-token
    const newToken = response.headers["x-new-token"] as string | undefined; // like refresh token
    if (newToken) {
      localStorage.setItem("token", newToken);
    }
    return response;
  },
  (error: Error) => {
    return Promise.reject(error);
  },
);

export default satellite;
