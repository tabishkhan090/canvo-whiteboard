import { loadEnv } from "@repo/backend-common/loadEnv"
loadEnv();
import { getUserIdFromRequest } from "./helper"
import { WebSocket, WebSocketServer } from "ws"
import { WsMessageHandler } from "./wsMessageHandler";
import { ConnectionManager } from "./connectionManager";


const wss = new WebSocketServer({port: 8081},()=>{
    console.log("port is running on: 8081")
});
const connectionManager = new ConnectionManager();

wss.on('connection', async function connection(ws, request) { //Run when new user connect for the first time
    // WebSocket first starts as HTTP. then upgrades to WebSocket
    let userId: string | null;
    try {
        userId = await getUserIdFromRequest(request as any);
    } catch (error) {
        console.error("Authentication failed:", error);
        ws.close();
        return;
    }
    console.log("userId:", userId);

    if (!userId || typeof userId !== "string") {
        ws.close();
        return;
    }
    connectionManager.addConnection(ws, userId);
    const wsObj = new WsMessageHandler(ws, userId, connectionManager);

    ws.on("close", () => {
        connectionManager.removeConnection(ws);
    });

    ws.on('message', async function message(data){
        wsObj.handle(data);
    })
})