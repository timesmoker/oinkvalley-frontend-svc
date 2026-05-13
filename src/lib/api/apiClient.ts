import axios from "axios";
import { getApiBaseUrl } from "@/lib/api/runtimeConfig";

/**
 * baseURL은 `npm run build` 시점에 박지 않는다.
 * `/runtime-config`에서 받은 값을 request interceptor가 첫 요청 직전에 채워 넣음.
 * 한 번 받은 값은 캐시되어 이후 요청은 추가 fetch 없이 그대로 재사용된다.
 */
const apiClient = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (!config.baseURL) {
    config.baseURL = await getApiBaseUrl();
  }
  return config;
});

export default apiClient;
