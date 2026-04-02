import axios from "axios";
import { BE_SERVER } from "../config";

type shapes = {
    type: "rect";
    x: number;
    y: number;
    w: number;
    h: number;
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

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, shapeTypeRef: React.MutableRefObject<"rect" | "circle" | "text">){
    let ExistShape: shapes [] = await getExistingShapes(roomId);
    let startX = 0;
    let startY = 0;
    let clicked = false;
    const ctx = canvas.getContext("2d");
    
    if(ctx) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
    }
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
    
    canvas.addEventListener("mousedown",(e)=>{
        if(shapeTypeRef.current === "text") {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const text = prompt("Enter text:");
            if(text) {
                const shape: shapes = {
                    type: "text",
                    x,
                    y,
                    text
                };
                ExistShape.push(shape);
                if(ctx) clearCanvas(ctx, canvas, ExistShape);
                socket.send(JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({shape}),
                    roomId
                }));
            }
        } else {
            clicked = true;
            const rect = canvas.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
        }
    })

    canvas.addEventListener("mouseup",(e)=>{
        if(shapeTypeRef.current === "text") return;
        
        clicked = false;
        const rect = canvas.getBoundingClientRect();
        const width = (e.clientX - rect.left) - startX;
        const height = (e.clientY - rect.top) - startY;
        
        let shape: shapes;
        if(shapeTypeRef.current === "circle") {
            const centerX = startX + width / 2;
            const centerY = startY + height / 2;
            const radius = Math.sqrt(width * width + height * height) / 2;
            shape = {
                type: "circle",
                centerX,
                centerY,
                radius
            };
        } else {
            shape = {
                type: "rect",
                x: startX,
                y: startY,
                w: width,
                h: height
            };
        }
        
        ExistShape.push(shape);
        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({shape}),
            roomId
        }));
    })

    canvas.addEventListener("mousemove",(e)=>{
        if(shapeTypeRef.current === "text") return;
        
        if(clicked){
            const rect = canvas.getBoundingClientRect();
            let w = (e.clientX - rect.left) - startX;
            let h = (e.clientY - rect.top) - startY;
            if(ctx)
                clearCanvas(ctx, canvas, ExistShape);
            console.log(startX, startY, w, h);
            
            if(shapeTypeRef.current === "circle") {
                ctx?.beginPath();
                const centerX = startX + w / 2;
                const centerY = startY + h / 2;
                const radius = Math.sqrt(w * w + h * h) / 2;
                ctx?.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx?.stroke();
            } else {
                drawRoundedRect(ctx!, startX, startY, w, h, 15);
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
        if(shape.type=="rect"){
            drawRoundedRect(ctx, shape.x, shape.y, shape.w, shape.h, 15);
        } else if(shape.type=="circle"){
            ctx?.beginPath();
            ctx?.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
            ctx?.stroke();
        } else if(shape.type=="text"){
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText(shape.text, shape.x, shape.y);
        }
    })
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    // Handle negative width/height
    if (width < 0) {
        x = x + width;
        width = Math.abs(width);
    }
    if (height < 0) {
        y = y + height;
        height = Math.abs(height);
    }
    
    // Ensure radius doesn't exceed half of width or height
    radius = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.stroke();
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