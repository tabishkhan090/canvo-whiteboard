import { getExistingShapes } from "./http";
type shapes = {
    type: "Rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "Circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "Pencil";
    x: number;
    y: number;
    text: string;
}

export class Game{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private roomId: string;
    private existingShapes: shapes[];
    private socket: WebSocket;
    private clicked = false;
    private startX = 0;
    private startY = 0;
    private selectedTool: string;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.selectedTool = "Circle";
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    setTool(tool: "Circle" | "Pencil" | "Rect"){
        this.selectedTool = tool;
    }

    async init(){
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers(){
        this.socket.onmessage = (event) =>{
        const message = JSON.parse(event.data);
        if(message.type=="chat"){
            const parsedShape = JSON.parse(message.message);
            this.existingShapes.push(parsedShape.shape);
            if(this.ctx)
                this.clearCanvas();
            }
        }
    }

    clearCanvas(){
        this.ctx.fillStyle = "#1a1a1a";
        this.ctx.fillRect(0, 0,this.canvas.width,this.canvas.height);
        
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;

        this.existingShapes.map((x)=>{
            if(x.type=="Rect"){
                this.ctx?.strokeRect(x.x, x.y, x.width, x.height);
            }else if(x.type == "Circle"){
                // const centerX = x.x + x.width/2;
                // const centerY = x.y + x.height/2;
                // const radius = Math.max(x.width,x.height) / 2;
                this.ctx?.beginPath()
                this.ctx?.arc(x.centerX, x.centerY, Math.abs(x.radius), 0, Math.PI * 2);
                this.ctx?.stroke();
                this.ctx?.closePath();
            }
        })
    }

    mouseDownHandler(e: any){
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientX;
    }
    mouseUpHandler(e: any){
        this.clicked = false;
        let shape: shapes | null=null;
        if(this.selectedTool == "Rect"){
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            shape = {
                type: this.selectedTool,
                x: this.startX,
                y: this.startY,
                height,
                width
            }
        }else if(this.selectedTool == "Circle"){
            const centerX = this.startX + e.clientX - this.startX / 2;
            const centerY = this.startY + e.clientY - this.startY / 2;
            shape = {
                type: this.selectedTool,
                centerX,
                centerY,
                radius: Math.max(centerX, centerY) / 2
            }
        }
        if (!shape)
            return;
        this.existingShapes.push(shape);
        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
    }
    mouseMoveHandler(e: any){
        if(this.clicked){
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            if(this.ctx)
                this.clearCanvas();
            if(this.selectedTool == "Rect"){
                this.ctx?.strokeRect(this.startX, this.startY, width, height);
            }else if(this.selectedTool == "Circle"){
                const centerX = this.startX + width/2;
                const centerY = this.startY + height/2;
                const radius = Math.max(width,height) / 2;
                this.ctx?.beginPath()
                this.ctx?.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx?.stroke();
                this.ctx?.closePath();
            }
        }
    }

    initMouseHandlers(){
        this.canvas.addEventListener("mousedown",this.mouseDownHandler)
        this.canvas.addEventListener("mouseup",this.mouseUpHandler)
        this.canvas.addEventListener("mousemove",this.mouseMoveHandler)
    }
}