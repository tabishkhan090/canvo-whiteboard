import { loadEnv } from "@repo/backend-common/loadEnv"
loadEnv();
import { getUserIdFromRequest } from "./helper"
import { WebSocket, WebSocketServer } from "ws"
import { prisma } from "@repo/db/prisma";


const wss = new WebSocketServer({port: 8081},()=>{ //Here we are creating new webSocket server
    console.log("port is running on: 8081")
});

interface User {
    ws: WebSocket,
    rooms : string[],
    userId: string
}

const users: User[] = [];

wss.on('connection', async function connection(ws, request) { //Run when new user connect for the first time
    // WebSocket first starts as HTTP
    // then upgrades to WebSocket
    // What is inside Request? Request.url, Request.headers
    // console.log(request.headers.cookie);
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
    users.push({
        ws,
        rooms: [],
        userId
    })

    ws.on("close", () => {
        const index = users.findIndex(user => user.ws === ws);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });

    //This runs whenever the user sends something from the frontend to the WebSocket server
    ws.on('message', async function message(data){
        let parsedData;
        try {
            const raw = typeof data === "string" ? data : data.toString();
            parsedData = JSON.parse(raw);
        } catch (e) {
            console.error("Invalid JSON received:", e);
            return;
        }
        console.log(parsedData);
        
        if(parsedData.type ==="join_room"){
            const user = users.find(x => x.ws===ws);
            user?.rooms.push(parsedData.roomId);
        }
        
        if(parsedData.type ==="leave_room"){
            const user = users.find(x => x.ws===ws);
            if(!user)  
                return
            user.rooms = user.rooms.filter(
            room => room !== parsedData.roomId);
        }
        
        // console.log(users);
        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            
            users.forEach(user => {
                if(user.rooms.includes(roomId) && user.ws !== ws){
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message,
                        roomId
                    }))
                }
            })
            
            await prisma.chat.create({
                data: {
                    roomId: Number(roomId),
                    message,
                    userId
                }
            })
        }
    })
})