import { Capacitor } from "@capacitor/core";
import { NativeLearning } from "./native";
export function speak(text: string) {
  if (Capacitor.isNativePlatform()) {
    void NativeLearning.speak({ text }).catch((error: Error) =>
      alert(error.message),
    );
    return;
  }
  if (!("speechSynthesis" in window)) {
    alert("当前浏览器不支持朗读");
    return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.8;
  speechSynthesis.speak(utterance);
}
