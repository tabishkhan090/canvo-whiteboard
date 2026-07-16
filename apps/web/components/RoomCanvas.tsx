"use client"
import { useEffect, useState } from "react"
import { Canvas } from "./Canvas";
import { WS_URL } from "../config" ;

export function RoomCanvas( {roomId} : {roomId: string}){
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(()=>{
        const ws = new WebSocket(WS_URL);
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