import { RoughCanvas } from "roughjs/bin/canvas"
import { Drawable } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator"
import { Message } from "../game";

const DEFAULT_RECT_STYLE = {
    stroke: "#1e1e1e",          // Dark gray border
    strokeWidth: 2,
    fill: "transparent",        // No fill
    fillStyle: "solid" as const,
    fillWeight: 1,
    roughness: 1.5,
    bowing: 1,
    strokeLineDash: [],
    strokeLineDashOffset: 0,
    strokeSharpness: "round" as const, // if supported by your RoughJS version
    curveStepCount: 9,
    curveFitting: 0.95,
    disableMultiStroke: false,
    disableMultiStrokeFill: false,
    strokeOpacity: 100,
    fillOpacity: 20,
};

type BoundingBox = { w: number, h: number, x: number, y: number }

// Performance optimization constants
const THROTTLE_MS = 33; //ender throttle (~30fps)

export class RectangleManager{
    constructor( 
        private ctx: CanvasRenderingContext2D,
        private rc: RoughCanvas,
        private generator: RoughGenerator,
        private socket: WebSocket,
        private roomId: string,
        private lastDragUpdate: number = 0
        ) {}
    
    private normalizeCoords(x: number, y: number, w: number, h: number){
        let nx = x;
        let ny = y;
        let nw = w;
        let nh = h;
        if(w<0){
            nx = x+w;
            nw = Math.abs(w);
        }
        if(h<0){
            ny = y+h;
            nh = Math.abs(h);
        }
        return {x: nx, y: ny, w: nw, h: nh};
    }
    private createDrawable(x: number, y: number, w: number, h: number): Drawable{
        return this.generator.rectangle(
            x,
            y,
            w,
            h,
            DEFAULT_RECT_STYLE
        )
    }
    createMessage(
        startX: number,
        startY: number,
        w: number,
        h: number
    ): Message {
        const rect = this.normalizeCoords(startX, startY, w, h);
        const shapeData: Drawable = this.createDrawable(
            rect.x,
            rect.y,
            rect.w,
            rect.h
        )
        return {
            id: crypto.randomUUID(),
            shape: "rectangle",
            shapeData,
            boundingBox: rect
        }
    }

    render(message: Message){
        this.ctx.save();
        this.rc.draw(message.shapeData);
        this.ctx.restore();
    }

    renderPreview(
        startX: number,
        startY: number,
        w: number,
        h: number,
    ){
        const shapeData = this.createDrawable(startX, startY, w, h);
        this.rc.draw(shapeData);
    }

    hitTest(
        msg: Message,
        nx: number,
        ny: number
    ): boolean {
        const { x, y, w, h } = msg.boundingBox;

        return (
            nx >= x &&
            nx <= x + w &&
            ny >= y &&
            ny <= y + h
        );
    }

    handleDrag(selectedMessage: Message, dx: number, dy: number){
        const nx = selectedMessage.boundingBox.x + dx;
        const ny = selectedMessage.boundingBox.y + dy;
        const {w, h} = selectedMessage.boundingBox;

        const newDrawable = this.createDrawable(nx, ny, w, h);
        selectedMessage.boundingBox = {
            ...selectedMessage.boundingBox,
            x: nx,
            y: ny,
        }
        selectedMessage.shapeData = newDrawable;
        
        // Throttle socket messages during drag operations
        if(Date.now() - this.lastDragUpdate >= THROTTLE_MS){
            this.lastDragUpdate = Date.now();
            this.socket.send(JSON.stringify({
                //send
            }))
        }
    }
}