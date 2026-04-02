"use client"
import { useEffect, useState } from "react"
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";
import { WS_URL } from "../config" ;

export function RoomCanvas( {roomId} : {roomId: string}){
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [selectedTool, setSelectedTool] = useState<"rect" | "circle" | "text">("rect");

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzY2E3ODgxZi0wMGI4LTQ1ZDctYmNlNy1kNDI5YTdiNThkZDMiLCJpYXQiOjE3NzU0MDMxMDMsImV4cCI6MTc3NjAwNzkwM30.jtTLe8QINd3Xmy6jRQAzrh-dZlAC7snlD3nRIKAGfnM`);
        ws.onopen = ()=>{
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }))
        }
    },[])

    if(!socket)
        return <div>
            Connecting to server...
        </div>

    return (
        <>
            <Toolbar selectedTool={selectedTool} onToolChange={setSelectedTool} />
            <Canvas roomId={roomId} socket={socket} selectedTool={selectedTool} />
        </>
    )
}    