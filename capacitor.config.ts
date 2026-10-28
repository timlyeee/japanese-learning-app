import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hiyori.japanese",
  appName: "日和日语",
  webDir: "dist",
  plugins: { CapacitorHttp: { enabled: true } },
};

export default config;
