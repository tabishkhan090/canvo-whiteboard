import { RoughCanvas } from "roughjs/bin/canvas";
import { RoughGenerator } from "roughjs/bin/generator";
import { Message, BoundingBox, EllipseMessage } from "../game";
import { Drawable } from "roughjs/bin/core";

const THROTTLE_MS = 33; 

export class EllipseManager{
    constructor(
        private ctx: CanvasRenderingContext2D,
        private rc: RoughCanvas,
        private generator: RoughGenerator,
        private socket: WebSocket,
        private roomId: string,
        private lastDragUpdate: number = 0
    ){}

    private normalizeCoords(w: number, h: number, x: number, y: number){
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
        return {x: nx, y: ny, w: nw, h: nh}
    }
    private createDrawable(x: number, y: number, w: number, h: number): Drawable{
        return this.generator.ellipse(
            x+w/2,
            y+h/2,
            w,
            h
        );
    }
    createMessage(
        startX: number,
        startY: number,
        w: number,
        h: number
    ) : Message{
        const rect = this.normalizeCoords(w, h, startX, startY)
        const shapeData = this.createDrawable(
            rect.x,
            rect.y,
            rect.w,
            rect.h
        )
        return {
            id: crypto.randomUUID(),
            shape: "ellipse",
            shapeData,
            boundingBox: rect
        }
    }

    render(message: Message){
        this.ctx.save();
        this.rc.draw(message.shapeData);
        this.ctx.restore();
    }

    renderPreview(startX: number, startY: number, w: number, h: number) {
        const rect = this.normalizeCoords(startX, startY, w, h);
        const drawable = this.createDrawable(
            rect.x,
            rect.y,
            rect.w,
            rect.h
        );
        
        this.rc.draw(drawable);
    }

    hitTest(msg: EllipseMessage, px: number, py:number) :boolean {
        const { x, y, w, h } = msg.boundingBox;

        const cx = x + w / 2;
        const cy = y + h / 2;

        const rx = w / 2;
        const ry = h / 2;

        const dx = px - cx;
        const dy = py - cy;

        return (
            (dx * dx) / (rx * rx) +
            (dy * dy) / (ry * ry) <= 1
        );
    }

    handleDrag(selectedMessage: EllipseMessage, dx: number, dy: number){
        const nx = selectedMessage.boundingBox.x + dx;
        const ny = selectedMessage.boundingBox.y + dy;

        const {w, h} = selectedMessage.boundingBox;
        const newDrawable = this.createDrawable(nx, ny, w, h);
        selectedMessage.boundingBox = {
            ...selectedMessage.boundingBox,
            x: nx,
            y: ny
        }

        selectedMessage.shapeData = newDrawable;

        if(Date.now() - this.lastDragUpdate >= THROTTLE_MS){
            this.lastDragUpdate = Date.now();

            this.socket.send(JSON.stringify({
                type: "update",
                roomId: this.roomId,
                message: selectedMessage
            }))
        }
    }
}