import axios from "axios";
import { BE_SERVER } from "../config";

type shapes = {
    type: "Rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "Circle";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "text";
    x: number;
    y: number;
    text: string;
}

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket){
    const ctx = canvas.getContext("2d");
    let ExistShape: shapes [] = await getExistingShapes(roomId);

    socket.onmessage = (event) =>{
        const message = JSON.parse(event.data);
        if(message.type=="chat"){
            const parsedShape = JSON.parse(message.message);
            ExistShape.push(parsedShape.shape);
            if(ctx)
                clearCanvas(ctx, canvas, ExistShape);
        }
    }

    if(ctx)
        clearCanvas(ctx, canvas, ExistShape);
    // ctx?.strokeRect(100,200,200,500); //x,y,w,h

    let clicked = false;
    let startX = 0;
    let startY = 0;
    
    canvas.addEventListener("mousedown",(e)=>{
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    })

    canvas.addEventListener("mouseup",(e)=>{
        clicked = false;
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        
        const shape: shapes = {
            //@ts-ignore
            type: window.selectedTool,
            x: startX,
            y: startY,
            height,
            width
        }
        ExistShape.push(shape);
        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId
        }))
        
    })

    canvas.addEventListener("mousemove",(e)=>{
        
        if(clicked){
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            if(ctx)
                clearCanvas(ctx, canvas, ExistShape);
            //@ts-ignore
            const selectedTool = window.selectedTool;
            if(selectedTool == "Rect"){
                ctx?.strokeRect(startX, startY, width, height);
            }else if(selectedTool == "Circle"){
                const centerX = startX + width/2;
                const centerY = startY + height/2;
                const radius = Math.max(width,height) / 2;
                ctx?.beginPath()
                ctx?.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx?.stroke();
                ctx?.closePath();
            }
        }
    })
}

function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, ExistShape: shapes[]){
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    ExistShape.map((shape)=>{
        if(shape.type=="Rect"){
            ctx?.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }else if(shape.type == "Circle"){
            const centerX = shape.x + shape.width/2;
            const centerY = shape.y + shape.height/2;
            const radius = Math.max(shape.width,shape.height) / 2;
            ctx?.beginPath()
            ctx?.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx?.stroke();
            ctx?.closePath();
        }
    })
}


async function getExistingShapes(roomId: string){
    // console.log("frontend", roomId);
    const res = await axios.get(`${BE_SERVER}/api/chats/${roomId}`);   
    // console.log("API response:", res.data); 
    const messages = res.data.chats || [];

    const shapes = messages.map((x: {message: string})=>{
        const messageData = JSON.parse(x.message);
        return messageData.shape;
    })
    return shapes;
}