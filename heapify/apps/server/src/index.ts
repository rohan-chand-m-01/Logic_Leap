import http from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { connectRedis } from "./config/redis";
import { migrateOnStartup } from "./config/migrate";
import { setSocketServer } from "./config/socket";
import { startCronJobs } from "./jobs/cron";

const start = async () => {
  await connectDatabase();
  await connectRedis();
  await migrateOnStartup();

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: env.FRONTEND_URL, credentials: true } });
  setSocketServer(io);
  io.on("connection", (socket) => {
    socket.emit("notification:new", { message: "Connected to Heapify socket" });
    socket.on("join:user-room", (userId: string) => socket.join(`user:${userId}`));
  });

  startCronJobs();

  server.listen(Number(env.PORT) || 5000, () => {
    console.log(`Server started on ${env.PORT || 5000}`);
  });
};

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
