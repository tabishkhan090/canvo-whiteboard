"use client"
import { useEffect, useRef } from "react";
import { initDraw } from "../draw";

export function Canvas({roomId, socket }: {roomId: string, socket: WebSocket }){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(()=>{
        if(canvasRef.current)
            initDraw(canvasRef.current, roomId, socket);
    },[canvasRef])
    
    return <div>
        <canvas width={2000} height={2000} ref={canvasRef} style={{ backgroundColor: "#1a1a1a" }}></canvas>
    </div>
}