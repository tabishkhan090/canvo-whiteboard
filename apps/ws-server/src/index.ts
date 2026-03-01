import { JWT_SECRET } from "@repo/backend-common/config"
import jwt from "jsonwebtoken"
import {WebSocket, WebSocketServer} from "ws"
import { prisma } from "@repo/db/prisma"

const wss = new WebSocketServer({port: 8080});

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
wss.on('connection', function connection(ws, Request) {
    if(!Request.url){
        ws.close();
        return;
    }
    const queryParams = new URLSearchParams(Request.url.split('?')[1]);
    const token = queryParams.get('token') || "";

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
    ws.on('message', async function message(data){
        let parsedData;
        if(typeof data != "string")
            parsedData = JSON.parse(data.toString());
        else
            parsedData = JSON.parse(data);

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

        if(parsedData.type ==="chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            await prisma.chat.create({
                data: {
                    roomId: roomId,
                    message,
                    userId
                }
            })
        
            users.forEach(user => {
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message,
                        roomId
                    }))
                }
            })
        }
    })
})