export function speak(text: string) {
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
