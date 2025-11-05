import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import setupSocket from "./socket.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔹 Enable JSON parsing
app.use(express.json());

// 🔹 CORS setup — allow frontend (Vite) origin
app.use(
  cors({
    origin: [
      "http://localhost:4173", // Vite preview server
      "http://localhost:5173", // Vite dev server
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// 🔹 Static file handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔹 API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// 🔹 Create HTTP server for Socket.io
const server = http.createServer(app);

// 🔹 Setup Socket.io (CORS must match frontend)
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:4173", // frontend port
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Pass the `io` instance to socket setup file
setupSocket(io);

// 🔹 Connect DB and start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
