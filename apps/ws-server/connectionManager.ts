import { WebSocket } from "ws"
export interface User {
    ws: WebSocket,
    userId: string,
    rooms: Set<string>
}
export class ConnectionManager{
    private connections = new Map<WebSocket, User>();
    private rooms = new Map<string, Set<WebSocket>>();
    constructor(){}

    addConnection(ws: WebSocket, userId: string){
        this.connections.set(ws,{
            ws,
            userId,
            rooms: new Set()
        })
    }

    getUser(ws: WebSocket): User | undefined{
        return this.connections.get(ws);
    }

    joinRoom(ws: WebSocket, roomId: string){
        const user = this.getUser(ws);
        if (!user) return;
        user.rooms.add(roomId);

        if(!this.rooms.has(roomId))
            this.rooms.set(roomId, new Set());
        this.rooms.get(roomId)?.add(ws);
    }

    leaveRoom(ws: WebSocket, roomId: string){
        const user = this.getUser(ws);
        if (!user) return;

        user.rooms.delete(roomId);
        const sockets = this.rooms.get(roomId);
        if (!sockets) return;
        sockets.delete(ws);

        if (sockets.size === 0) {
            this.rooms.delete(roomId);
        }
    }

    removeConnection(ws: WebSocket) {
        const user = this.getUser(ws);
        if (!user) return;

        for (const roomId of user.rooms) {
            this.leaveRoom(ws, roomId);
        }

        this.connections.delete(ws);
    }

    getRoomSockets(roomId: string): Set<WebSocket> | undefined {
        return this.rooms.get(roomId);
    }

    broadcastService(roomId: string, payload: unknown, excludeWs?: WebSocket){
        const sockets = this.getRoomSockets(roomId);
        if(!sockets) return;
        const msg = JSON.stringify(payload);
        for(const ws of sockets){
            if(ws===excludeWs)  continue;
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(msg);
            }
        }
    }
    
}