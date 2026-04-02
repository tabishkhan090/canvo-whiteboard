import { JWT_SECRET } from "@repo/backend-common/config"
import jwt from "jsonwebtoken"
import {WebSocket, WebSocketServer} from "ws"
import { prisma } from "@repo/db";
// const JWT_SECRET = "ewrcwectrewtrevtw"
const wss = new WebSocketServer({port: 8081},()=>{ //Here we are creating new webSocket server
    console.log("port is running on: 8081")
});

interface User {
    ws: WebSocket,
    rooms : string[],
    userId: string
}
const users: User[] = [];

function checkUser(token: string): string | null {
    const result = jwt.verify(token,JWT_SECRET);
    if(typeof result == "string"){
        return null;
    }
    if(!result || !result.userId){
        return null;
    }

    return result.userId;
}
wss.on('connection', function connection(ws, Request) { //Run when new user connect for the first time
    if(!Request.url){
        ws.close();
        return;
    }
    const queryParams = new URLSearchParams(Request.url.split('?')[1]);
    const token = queryParams.get('token') || "";
    console.log(token);
    const userId = checkUser(token);
    if (!userId) {
        ws.close();
        return;
    }
    
    users.push({
        ws,
        rooms: [],
        userId
    })

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
            user?.rooms.filter(parsedData.roomId);
        }
        
        // console.log(users);
        if(parsedData.type ==="chat"){
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