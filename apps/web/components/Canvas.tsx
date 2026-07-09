"use client"
import { useEffect, useRef } from "react";
import { initDraw } from "../draw";

export function Canvas({roomId, socket, selectedTool}: {roomId: string, socket: WebSocket, selectedTool: "rect" | "circle" | "text"}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const selectedToolRef = useRef(selectedTool);
    
    useEffect(() => {
        selectedToolRef.current = selectedTool;
    }, [selectedTool]);
    
    useEffect(()=>{
        if(canvasRef.current)
            initDraw(canvasRef.current, roomId, socket, selectedToolRef);
    },[canvasRef])
    
    return <div style={{ marginTop: "60px", backgroundColor: "#1a1a1a", minHeight: "100vh" }}>
        <canvas width={2000} height={2000} ref={canvasRef} style={{ backgroundColor: "#1a1a1a" }}></canvas>
    </div>
}