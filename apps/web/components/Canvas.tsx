"use client"
import { useEffect, useRef, useState } from "react";
import { initDraw } from "../draw";
import { IconButton } from "./iconBotton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "../draw/draw";
import { Game2 } from "../draw/game";
import { Shape } from "../draw/game";

export function Canvas({roomId, socket}: {roomId: string, socket: WebSocket}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool, setSelectedTool] = useState<Shape>("rectangle");
    const [game, setGame] = useState<Game2>();
    
    useEffect(()=>{
        // //window is a global object provided by the browser. It is not part of React.
        // //@ts-ignore
        // window.selectedTool = selectedTool;
        game?.setCurrentShape(selectedTool);
    },[selectedTool, game])
    
    useEffect(()=>{
        if(canvasRef.current){
            const g = new Game2(canvasRef.current, roomId, socket);
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
            <IconButton activated={selectedTool==="line"} icon={<Pencil/>} onclick={() => {setSelectedTool("line")}} />
            <IconButton activated={selectedTool==="ellipse"} icon={<Circle/>} onclick={() => {setSelectedTool("ellipse")}} />
            <IconButton activated={selectedTool==="rectangle"} icon={<RectangleHorizontalIcon/>} onclick={() => {setSelectedTool("rectangle")}} />
        </div>
    </div>
}