import { RawData, WebSocket } from "ws";
import { ConnectionManager } from "./connectionManager";
import { prisma } from "@repo/db/prisma";

type JoinRoomMessage = {
    type: "join_room";
    roomId: string;
};

type LeaveRoomMessage = {
    type: "leave_room";
    roomId: string;
};

type CreateMessage = {
    type: "create";
    roomId: string;
    message: any;
};

export class WsMessageHandler{
    constructor(
        private ws: WebSocket,
        private userId: string,
        private connections: ConnectionManager,
    ){}
    handle(rawData: RawData){
        try{
            const data =
            typeof rawData === "string"
                ? rawData
                : rawData.toString();
                const parsedData = JSON.parse(data);
            
            switch (parsedData.type) {
                case "join_room":
                    this.handleJoinRoom(parsedData);
                    break;

                case "leave_room":
                    this.handleLeaveRoom(parsedData);
                    break;

                case "create":
                    this.handleCreate(parsedData);
                    break;

                case "update":
                    this.handleUpdate(parsedData);
                    break;

                case "delete":
                    this.handleDelete(parsedData);
                    break;

                case "undo":
                    this.handleUndo(parsedData);
                    break;

                case "redo":
                    this.handleRedo(parsedData);
                    break;

                default:
                    this.sendError("Unknown message type");
            }
        }catch(err){
            throw new Error("Invalid JSON");
        }
    }

    private handleJoinRoom(data: JoinRoomMessage){
        this.connections.joinRoom(this.ws, data.roomId);
    }

    private handleLeaveRoom(data: LeaveRoomMessage){
        this.connections.leaveRoom(this.ws, data.roomId);
    }

    private async handleCreate(data: CreateMessage){
        const payload = {
            type: "create",
            message: data.message
        }
        this.connections.broadcastService(data.roomId, payload, this.ws);
        try{
            await prisma.chat.create({
            data: {
                id: data.message.id,
                message: data.message,
                roomId: Number(data.roomId),
                userId: this.userId
            }
        })
        }catch(error){
            console.error("Failed to create shape:", error);
        }
    }

    private async handleUpdate(data: any){
        const payload = {
            type: "update",
            message: data.message
        }
        this.connections.broadcastService(data.roomId, payload, this.ws);
        try {
            await prisma.chat.update({
                where: {
                    id: data.message.id,
                },
                data: {
                    message: data.message,
                },
            });
    } catch (error) {
            console.error("Failed to update shape:", error);
        }
    }
    
    private async handleDelete(data: any) {
        const payload = {
            type: "delete",
            id: data.id,
        };

        this.connections.broadcastService(
            data.roomId,
            payload,
            this.ws
        );

        try {
            await prisma.chat.delete({
                where: {
                    id: data.id,
                },
            });
        } catch (error) {
            console.error("Failed to delete shape:", error);
        }
    }

    private handleUndo(data: any) {
        // HistoryService
    }

    private handleRedo(data: any) {
        // HistoryService
    }

    private sendError(message: string) {
        this.ws.send(
            JSON.stringify({
                type: "error",
                message,
            })
        );
    }
}