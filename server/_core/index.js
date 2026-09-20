import "dotenv/config";
import { exec } from "node:child_process";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth.js";
import { registerStorageProxy } from "./storageProxy.js";
import { appRouter } from "../routers.js";
import { createContext } from "./context.js";
import { serveStatic, setupVite } from "./vite.js";
function isPortAvailable(port) {
    return new Promise(resolve => {
        const server = net.createServer();
        server.listen(port, () => {
            server.close(() => resolve(true));
        });
        server.on("error", () => resolve(false));
    });
}
async function findAvailablePort(startPort = 3000) {
    for (let port = startPort; port < startPort + 20; port++) {
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
    const app = express();
    const server = createServer(app);
    // Configure body parser with larger size limit for file uploads
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    registerStorageProxy(app);
    registerOAuthRoutes(app);
    // tRPC API
    app.use("/api/trpc", createExpressMiddleware({
        router: appRouter,
        createContext,
    }));
    // development mode uses Vite, production mode uses static files
    if (process.env.NODE_ENV === "development") {
        await setupVite(app, server);
    }
    else {
        serveStatic(app);
    }
    const preferredPort = parseInt(process.env.PORT || "3000");
    if (process.env.NODE_ENV === "development" && !(await isPortAvailable(preferredPort))) {
        console.error(`Port ${preferredPort} is already in use. Stop the existing TrustLens dev server before running npm run dev again.`);
        return;
    }
    const port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
        console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }
    server.listen(port, () => {
        const url = `http://localhost:${port}/`;
        console.log(`Server running on ${url}`);
        if (process.env.NODE_ENV === "development" && process.env.NO_BROWSER !== "1") {
            exec(`start "" "${url}"`);
        }
    });
}
startServer().catch(console.error);
