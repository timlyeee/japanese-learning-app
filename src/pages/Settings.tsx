import { useState } from "react";
import { parseProgress } from "../lib/progress";
import type { ApiConfig, Progress } from "../types";
export default function Settings({
  progress,
  apiKey,
  save,
  restore,
}: {
  progress: Progress;
  apiKey: string;
  save: (config: ApiConfig, key: string) => void;
  restore: (progress: Progress) => void;
}) {
  const [config, setConfig] = useState(progress.config);
  const [key, setKey] = useState(apiKey);
  const [status, setStatus] = useState("");
  function exportProgress() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(progress, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "日和-学习进度.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <h1>自己的学习空间，自己做主。</h1>
      <p className="muted">
        连接你选择的 AI 服务，支持兼容 Chat Completions 的接口。
      </p>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          save(
            {
              baseUrl: config.baseUrl.trim().replace(/\/$/, ""),
              model: config.model.trim(),
            },
            key.trim(),
          );
          setStatus("配置已保存，可以前往 AI 对话练习。");
        }}
      >
        <div className="notice">
          应用本身免费，无广告。AI
          请求可能产生提供商费用。密钥只在当前页面内存中保存，刷新后需重新填写；服务地址与学习进度保存在本机。
        </div>
        <label htmlFor="base-url">API 基础地址</label>
        <input
          id="base-url"
          type="url"
          required
          value={config.baseUrl}
          onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
        />
        <p className="muted">填写基础地址，自动追加 /chat/completions。</p>
        <label htmlFor="api-key">API 密钥</label>
        <input
          id="api-key"
          type="password"
          autoComplete="off"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="输入密钥，或使用服务器 AI_API_KEY"
        />
        <label htmlFor="model">模型名称</label>
        <input
          id="model"
          required
          value={config.model}
          onChange={(e) => setConfig({ ...config, model: e.target.value })}
        />
        <div className="actions" style={{ justifyContent: "flex-start" }}>
          <button className="primary">保存配置</button>
          <button type="button" className="secondary" onClick={exportProgress}>
            导出学习进度
          </button>
        </div>
        <label htmlFor="restore">从备份恢复学习进度</label>
        <input
          id="restore"
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              if (file.size > 1_000_000) throw new Error("备份文件过大");
              const restored = parseProgress(await file.text());
              if (confirm("导入会替换当前学习进度，是否继续？")) {
                restore(restored);
                setConfig(restored.config);
                setStatus("进度已恢复");
              }
            } catch (err) {
              setStatus(err instanceof Error ? err.message : "导入失败");
            }
            e.target.value = "";
          }}
        />
        <div className="status" role="status">
          {status}
        </div>
      </form>
    </>
  );
}
