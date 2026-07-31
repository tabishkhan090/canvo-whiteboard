"use client"
import { useEffect, useRef, useState } from "react";
import { initDraw } from "../draw";
import { IconButton } from "./iconBotton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "../draw/game";

type Shape = "Circle" | "Rect" | "Pencil"

export function Canvas({roomId, socket}: {roomId: string, socket: WebSocket}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool, setSelectedTool] = useState<Shape>("Circle");
    const [game, setGame] = useState<Game>();
    
    
    useEffect(()=>{
        // //window is a global object provided by the browser. It is not part of React.
        // //@ts-ignore
        // window.selectedTool = selectedTool;
        game?.setTool(selectedTool);
    },[selectedTool, game])
    
    useEffect(()=>{
        if(canvasRef.current){
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return ()=>{
                g.destroy();
            }
        }
        // initDraw(canvasRef.current, roomId, socket);
    },[canvasRef])
    
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