import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import ModuleSelect from "./components/ModuleSelect";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Kana from "./pages/Kana";
import Words from "./pages/Words";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import {
  loadProgress,
  scheduleReview,
  STORAGE_KEY,
  withActivity,
} from "./lib/progress";
import type { ModuleId, Page } from "./types";
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selected, setSelected] = useState<number | null>(null);
  const [progress, setProgress] = useState(loadProgress);
  const [apiKey, setApiKey] = useState("");
  const [storageError, setStorageError] = useState("");
  const [module, setModule] = useState<ModuleId | null>(null);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      setStorageError("");
    } catch {
      setStorageError("浏览器无法保存进度，请导出备份并检查存储空间。");
    }
  }, [progress]);
  const activity = () => setProgress((p) => withActivity(p));
  function navigate(next: Page) {
    setPage(next);
    if (next === "courses") setSelected(null);
  }
  function openCourse(id: number) {
    setSelected(id);
    setPage("courses");
  }
  if (module === null)
    return (
      <ModuleSelect
        onSelect={(id) => {
          setModule(id);
          setPage("home");
        }}
      />
    );
  return (
    <Layout
      page={page}
      navigate={navigate}
      days={progress.days.length}
      onBack={() => setModule(null)}
    >
      {storageError && (
        <p role="alert" className="notice error">
          {storageError}
        </p>
      )}
      {page === "home" && (
        <Home progress={progress} navigate={navigate} openCourse={openCourse} />
      )}
      {page === "courses" && (
        <Courses
          key={selected ?? "list"}
          selected={selected}
          select={setSelected}
          completed={progress.done}
          complete={(id) =>
            setProgress((p) =>
              withActivity({ ...p, done: [...new Set([...p.done, id])] }),
            )
          }
          kana={() => navigate("kana")}
          chat={() => navigate("chat")}
        />
      )}
      {page === "kana" && (
        <Kana
          activity={activity}
          results={progress.quiz}
          finish={(id, result) =>
            setProgress((p) =>
              withActivity({
                ...p,
                quiz: {
                  ...p.quiz,
                  [id]:
                    !p.quiz[id] || result.correct > p.quiz[id].correct
                      ? result
                      : p.quiz[id],
                },
              }),
            )
          }
        />
      )}
      {page === "words" && (
        <Words
          progress={progress}
          rate={(id, known) =>
            setProgress((p) =>
              withActivity({
                ...p,
                reviews: {
                  ...p.reviews,
                  [id]: scheduleReview(p.reviews[id], known),
                },
              }),
            )
          }
          chat={() => navigate("chat")}
        />
      )}
      {page === "chat" && (
        <Chat config={progress.config} apiKey={apiKey} activity={activity} />
      )}
      {page === "settings" && (
        <Settings
          progress={progress}
          apiKey={apiKey}
          save={(config, key) => {
            setProgress((p) => ({ ...p, config }));
            setApiKey(key);
          }}
          restore={setProgress}
        />
      )}
    </Layout>
  );
}
