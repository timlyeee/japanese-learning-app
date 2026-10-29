import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.learnnew.app",
  appName: "学点新的？",
  webDir: "dist",
  plugins: { CapacitorHttp: { enabled: true } },
};

export default config;
