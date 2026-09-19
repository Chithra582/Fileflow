import express from "express";
import path from "path";
import http from "http";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Start Python FastAPI background process on port 8000
  const pythonCmd = process.env.PYTHON_CMD || (process.platform === "win32" ? "python" : "python3");
  const pythonArgs = ["-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"];
  
  console.log("Starting Python FastAPI backend on port 8000...");
  const pythonProcess = spawn(pythonCmd, pythonArgs, {
    stdio: "inherit",
    detached: false,
  });

  pythonProcess.on("error", (err) => {
    console.error("Failed to start FastAPI backend:", err.message);
  });

  pythonProcess.on("exit", (code) => {
    console.log(`FastAPI backend exited with code ${code}`);
  });

  process.on("exit", () => {
    pythonProcess.kill();
  });
  process.on("SIGINT", () => {
    pythonProcess.kill();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    pythonProcess.kill();
    process.exit(0);
  });

  // Proxy /health and /convert to Python FastAPI
  const proxyToFastAPI = (req: express.Request, res: express.Response) => {
    // Map /api/convert -> /convert and /api/health -> /health if needed
    let targetPath = req.originalUrl;
    if (targetPath.startsWith("/api/")) {
      targetPath = targetPath.replace("/api/", "/");
    }

    const options: http.RequestOptions = {
      hostname: "127.0.0.1",
      port: 8000,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: "127.0.0.1:8000",
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error("Proxy error to FastAPI:", err.message);
      if (!res.headersSent) {
        res.status(503).json({
          status: "backend_initializing",
          message: "FastAPI converter service is starting up, please try again in a few seconds.",
          error: err.message,
        });
      }
    });

    req.pipe(proxyReq);
  };

  app.all("/health*", proxyToFastAPI);
  app.all("/convert*", proxyToFastAPI);
  app.all("/api/health*", proxyToFastAPI);
  app.all("/api/convert*", proxyToFastAPI);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FileFlow server running on http://localhost:${PORT}`);
  });
}

startServer();
