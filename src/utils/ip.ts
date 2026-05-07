import axios, { type AxiosRequestConfig } from "axios";

export async function getIP(config: AxiosRequestConfig) {
  const response = await axios.get<{ ip: string }>(
    "https://api.ipify.org?format=json",
    config,
  );
  return response.data.ip;
}
