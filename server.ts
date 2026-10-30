import path from "path";
import dotenv from "dotenv";

// Load local environment variables (.env and optional .env.local)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

import express from "express";
import { createServer as createViteServer } from "vite";
import app from "./api/app";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  // Vite middleware for local development
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
    console.log(`\n==================================================`);
    console.log(`🌱 Raitu Vedika Server running locally!`);
    console.log(`🔗 Local URL:    http://localhost:${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🔥 Firebase Project: ${process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'raitu-vedika'}`);
    console.log(`📦 Firestore DB:     ${process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID || '(default)'}`);
    console.log(`==================================================\n`);
  });
}

startServer();
