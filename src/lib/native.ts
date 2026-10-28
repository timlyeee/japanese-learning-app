import { registerPlugin } from "@capacitor/core";
export const NativeLearning = registerPlugin<{
  speak(options: { text: string }): Promise<void>;
  backup(options: { content: string }): Promise<void>;
}>("NativeLearning");
