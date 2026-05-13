import type { RuntimeConfig } from "@/app/runtime-config/route";

/**
 * 클라이언트에서 `/runtime-config`를 한 번만 가져와 캐시한다.
 *
 * - 같은 페이지 로드에서 여러 곳이 동시에 호출해도 fetch는 1회만 일어난다.
 * - SSR(서버)에서는 호출하지 말 것 — 서버는 `process.env.API_URL`을 직접 읽는다.
 */

let cached: RuntimeConfig | null = null;
let inFlight: Promise<RuntimeConfig> | null = null;

const FALLBACK: RuntimeConfig = {
  apiUrl: "",
  signupEnabled: false,
};

async function fetchConfig(): Promise<RuntimeConfig> {
  const res = await fetch("/runtime-config", {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!res.ok) {
    throw new Error(`GET /runtime-config failed: ${res.status}`);
  }
  const data = (await res.json()) as Partial<RuntimeConfig> | null;
  return {
    apiUrl: typeof data?.apiUrl === "string" ? data.apiUrl : "",
    signupEnabled: data?.signupEnabled === true,
  };
}

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (cached) return cached;
  if (!inFlight) {
    inFlight = fetchConfig()
      .then((cfg) => {
        cached = cfg;
        return cfg;
      })
      .catch((err) => {
        inFlight = null;
        throw err;
      });
  }
  return inFlight;
}

export async function getApiBaseUrl(): Promise<string> {
  const cfg = await loadRuntimeConfig();
  return cfg.apiUrl || FALLBACK.apiUrl;
}

export async function getSignupEnabled(): Promise<boolean> {
  const cfg = await loadRuntimeConfig();
  return cfg.signupEnabled;
}
