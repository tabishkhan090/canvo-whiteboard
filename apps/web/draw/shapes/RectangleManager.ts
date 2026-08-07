import { RoughCanvas } from "roughjs/bin/canvas"
import { Drawable } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator"

type BoundingBox = { w: number, h: number, x: number, y: number }

type Message = {
    id: string;
    shape: "rectangle";
    shapeData: Drawable;
    boundingBox: BoundingBox;
}
function normalizeCoords(x: number, y: number, w: number, h: number){
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
export class RectangleManager{
    constructor( 
        private ctx: CanvasRenderingContext2D,
        private rc: RoughCanvas,
        private generator: RoughGenerator,
        private socket: WebSocket,
        private roomId: string,
        ) {}
    
    createMessage(
        startX: number,
        startY: number,
        w: number,
        h: number
    ): Message {
        const rect = normalizeCoords(startX, startY, w, h);
        const shapeData: Drawable = this.generator.rectangle(
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
        const shapeData = this.rc.generator.rectangle(startX, startY, w, h);
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
        
    }
}