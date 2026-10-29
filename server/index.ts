import express from "express";
import { fileURLToPath } from "node:url";
import { createApp } from "./app";

const production = process.argv.includes("--production");
const app = createApp();
if (production) {
  const dist = fileURLToPath(new URL("../dist/", import.meta.url));
  app.use(express.static(dist));
  app.get("/{*path}", (req, res) => {
    if (req.path.startsWith("/api/")) {
      res.status(404).json({ error: "接口不存在" });
      return;
    }
    res.sendFile(dist + "index.html");
  });
}
const port = Number(
  production ? process.env.PORT || 3000 : process.env.API_PORT || 3001,
);
const server = app.listen(port, "127.0.0.1", () =>
  console.log(
    production
      ? `学点新的？：http://127.0.0.1:${port}`
      : `API：http://127.0.0.1:${port}/api/health`,
  ),
);
server.on("error", (error) => {
  console.error(
    `服务启动失败：${error.message}。请检查端口 ${port} 是否被占用。`,
  );
  process.exit(1);
});
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => server.close(() => process.exit(0)));
