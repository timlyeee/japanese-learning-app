import { kanaRows } from "../data/content";
import { speak } from "../lib/speech";
export default function Kana({ activity }: { activity: () => void }) {
  return (
    <>
      <h1>从一个音，认识一门语言。</h1>
      <p className="muted">
        点击假名收听日语发音。每格依次为平假名、片假名和罗马音。
      </p>
      <p className="notice">
        を 作助词通常读 o；ん 是鼻音。拗音如 きゃ / きゅ / きょ，由假名与小写 ゃ
        / ゅ / ょ 组合；小写 っ
        表示下一辅音前停顿一拍，长音多延长一拍。罗马音仅供入门辅助。
      </p>
      <div className="kana-grid">
        {kanaRows.flatMap(([h, k, r]) =>
          [...h].map((letter, i) => (
            <button
              key={letter}
              className="kana"
              onClick={() => {
                speak(letter);
                activity();
              }}
            >
              {letter} <span className="muted">{k[i]}</span>
              <small>{r.split(" ")[i]}</small>
            </button>
          )),
        )}
      </div>
    </>
  );
}
