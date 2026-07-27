"use client"
import { useEffect, useRef, useState } from "react";
import { initDraw } from "../draw";
import { IconButton } from "./iconBotton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";

type Shape = "Circle" | "Rect" | "Pencil"

export function Canvas({roomId, socket}: {roomId: string, socket: WebSocket}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool, setSelectedTool] = useState<Shape>("Circle")
    
    useEffect(()=>{
        if(canvasRef.current)
            initDraw(canvasRef.current, roomId, socket);
    },[canvasRef])

    useEffect(()=>{
        //@ts-ignore
        window.selectedTool = selectedTool;
    },[selectedTool])
    
    return (
        <div className="min-h-screen w-screen overflow-hidden">
            <canvas width={window.innerWidth} height={window.innerHeight} ref={canvasRef} ></canvas>
            <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool}/>
        </div>
    )
}

function TopBar({
    selectedTool,
    setSelectedTool
}: {
    selectedTool: Shape,
    setSelectedTool: (s: Shape) => void
}){
    return <div style={{
        position: "fixed",
        top: 10,
        left: 10,
    }}>
        <div className="flex">
            <IconButton activated={selectedTool==="Pencil"} icon={<Pencil/>} onclick={() => {setSelectedTool("Pencil")}} />
            <IconButton activated={selectedTool==="Circle"} icon={<Circle/>} onclick={() => {setSelectedTool("Circle")}} />
            <IconButton activated={selectedTool==="Rect"} icon={<RectangleHorizontalIcon/>} onclick={() => {setSelectedTool("Rect")}} />
        </div>
    </div>
}