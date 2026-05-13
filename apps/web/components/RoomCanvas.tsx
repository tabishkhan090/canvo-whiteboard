"use client"
import { useEffect, useState } from "react"
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";
import { WS_URL } from "../config" ;

export function RoomCanvas( {roomId} : {roomId: string}){
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzY2E3ODgxZi0wMGI4LTQ1ZDctYmNlNy1kNDI5YTdiNThkZDMiLCJpYXQiOjE3NzU0MDMxMDMsImV4cCI6MTc3NjAwNzkwM30.jtTLe8QINd3Xmy6jRQAzrh-dZlAC7snlD3nRIKAGfnM`);
        // connection is still being established
        // "When connection becomes ready, run this function", ws.send may fail. bcoz conntion maybe not established yet 
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
            <Canvas roomId={roomId} socket={socket} />
        </> 
    )
}