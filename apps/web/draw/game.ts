import { RoughCanvas } from "roughjs/bin/canvas";
import { RectangleManager } from "./shapes/RectangleManager";
import rough from "roughjs";
import { RoughGenerator } from "roughjs/bin/generator";
import { Drawable } from "roughjs/bin/core";
import { getExistingShapes } from "./http";

type BoundingBox = {
    x: number;
    y: number;
    w: number;
    h: number;
};

export type Message = {
    id: string;
    shape: "rectangle";
    shapeData: Drawable;
    boundingBox: BoundingBox;
};

export class Game2{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private socket: WebSocket;
    private rc: RoughCanvas;
    private generator: RoughGenerator;
    private roomId: string;
    private messages: Message[] = [];

    private startX: number;
    private startY: number;
    private clicked: boolean;

    private rectangleManager: RectangleManager;

    private selectedMessage: Message | null=null;
    private isDragging = false;
    private prevX = 0;
    private prevY = 0;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket){
        this.startX = 0;
        this.startY = 0;
        this.clicked = false;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.socket = socket;
        this.roomId= roomId;
        this.rc = rough.canvas(this.ctx.canvas);
        this.generator = rough.generator();
        this.rectangleManager = new RectangleManager(
            this.ctx,
            this.rc,
            this.generator,
            this.socket,
            this.roomId
        )
        this.initMouseHandlers();
        this.initSocketHandler();
        this.loadMessages();
    }
    async loadMessages(){
        this.messages = await getExistingShapes(this.roomId);
        console.log(this.messages);
        this.renderCanvas();
    }
    mouseDownHandler = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        
        for(let i = this.messages.length-1; i>=0; i--){
            const msg = this.messages[i];
            if (!msg) continue;
            if(
                this.rectangleManager.hitTest(
                    msg,
                    this.startX,
                    this.startY
                )
            ){
                this.prevX = this.startX;
                this.prevY = this.startY;
                this.selectedMessage = msg;
                this.isDragging = true;
                return;
            }
        }
        this.clicked = true;
    }

    mouseMoveHandler = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        
        if(this.isDragging && this.selectedMessage){
            const dx = currentX - this.prevX;
            const dy = currentY - this.prevY;
            this.rectangleManager.handleDrag(
                this.selectedMessage,
                dx,
                dy,
            )
            
            this.prevX = currentX;
            this.prevY = currentY;
            
            this.renderCanvas();
            return;
        }
        
        if(!this.clicked) return;

        const w = currentX - this.startX;
        const h = currentY - this.startY;
        
        this.renderCanvas();
        this.rectangleManager.renderPreview(
            this.startX,
            this.startY,
            w,
            h
        );
    }

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        if(this.isDragging){
            this.selectedMessage = null;
            this.isDragging = false;
            return;
        }
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        const w = currentX - this.startX;
        const h = currentY - this.startY;
        const message = this.rectangleManager.createMessage(
            this.startX,
            this.startY,
            w,
            h
        );
        this.messages.push(message);
        this.renderCanvas();
        this.socket.send(JSON.stringify({
            type: "create",
            message,
            roomId: this.roomId
        }),
    );
    }

    initMouseHandlers(){
        this.canvas.addEventListener("mousedown",this.mouseDownHandler);
        this.canvas.addEventListener("mouseup",this.mouseUpHandler);
        this.canvas.addEventListener("mousemove",this.mouseMoveHandler);
    }

    renderCanvas(){
        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        )

        for( const m of this.messages){
            this.rectangleManager.render(m);
        }
    }

    initSocketHandler(){
        this.socket.onmessage = (event)=>{
        const data = JSON.parse(event.data);
            switch(data.type){
                case "create":{
                    const message: Message = data.message;
                    this.messages.push(message);
                    this.renderCanvas();
                    break;
                }
                case "update":{

                    break;
                }
                case "delete":{
                    break;
                }
            }
        }
    }
}