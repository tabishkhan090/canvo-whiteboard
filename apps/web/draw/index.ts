import axios from "axios";
import { BE_SERVER } from "../config";

type shapes = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
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
        const rect = canvas.getBoundingClientRect();
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        
        const shape: shapes = {
            type: "rect",
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
            // console.log(startX, startY, w, h);
            ctx?.strokeRect(startX, startY, width, height);
        }
    })
}

function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, ExistShape: shapes[]){
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    ExistShape.map((shape)=>{
        if(shape.type=="rect"){
            ctx?.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    })
}


async function getExistingShapes(roomId: string){
    // console.log(roomId)
    const res = await axios.get(`${BE_SERVER}/chats/${roomId}`);   
    console.log("API response:", res.data); 
    const messages = res.data.chats || [];

    const shapes = messages.map((x: {message: string})=>{
        const messageData = JSON.parse(x.message);
        return messageData.shape;
    })

    return shapes;
}