import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator";
import { DiamondMessage, Message } from "../game";

const DEFAULT_DIAMOND_STYLE = {
    stroke: "#1e1e1e",
    strokeWidth: 2,
    fill: "transparent",
    fillStyle: "solid" as const,
    fillWeight: 1,
    roughness: 1.5,
    bowing: 1,
    strokeLineDash: [],
    strokeLineDashOffset: 0,
    strokeSharpness: "round" as const,
    curveStepCount: 9,
    curveFitting: 0.95,
    disableMultiStroke: false,
    disableMultiStrokeFill: false,
    strokeOpacity: 100,
    fillOpacity: 20,
};

const THROTTLE_MS = 33;

export class DiamondManager {
    constructor(
        private ctx: CanvasRenderingContext2D,
        private rc: RoughCanvas,
        private generator: RoughGenerator,
        private socket: WebSocket,
        private roomId: string,
        private lastDragUpdate: number = 0
    ) {}

    private normalizeCoords(x: number, y: number, w: number, h: number) {
        let nx = x;
        let ny = y;
        let nw = w;
        let nh = h;

        if (w < 0) {
            nx = x + w;
            nw = Math.abs(w);
        }

        if (h < 0) {
            ny = y + h;
            nh = Math.abs(h);
        }

        return { x: nx, y: ny, w: nw, h: nh };
    }

    private createDrawable(
        x: number,
        y: number,
        w: number,
        h: number
    ): Drawable {
        return this.generator.polygon(
            [
                [x + w / 2, y],
                [x + w, y + h / 2],
                [x + w / 2, y + h],
                [x, y + h / 2],
            ],
            DEFAULT_DIAMOND_STYLE
        );
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
        );

        const message = {
            id: crypto.randomUUID(),
            shape: "diamond",
            shapeData,
            boundingBox: rect,
        };

        return message as Message;
    }

    render(message: Message) {
        this.ctx.save();
        this.rc.draw(message.shapeData);
        this.ctx.restore();
    }

    renderPreview(
        startX: number,
        startY: number,
        w: number,
        h: number
    ) {
        const rect = this.normalizeCoords(startX, startY, w, h);

        const drawable = this.createDrawable(
            rect.x,
            rect.y,
            rect.w,
            rect.h
        );

        this.rc.draw(drawable);
    }

    hitTest(
        msg: DiamondMessage,
        nx: number,
        ny: number
    ): boolean {
        const { x, y, w, h } = msg.boundingBox!;

        return (
            nx >= x &&
            nx <= x + w &&
            ny >= y &&
            ny <= y + h
        );
    }

    handleDrag(selectedMessage: DiamondMessage, dx: number, dy: number) {
        const nx = selectedMessage.boundingBox.x + dx;
        const ny = selectedMessage.boundingBox.y + dy;
        const { w, h } = selectedMessage.boundingBox;

        const newDrawable = this.createDrawable(nx, ny, w, h);

        selectedMessage.boundingBox = {
            ...selectedMessage.boundingBox,
            x: nx,
            y: ny,
        };

        selectedMessage.shapeData = newDrawable;

        if (Date.now() - this.lastDragUpdate >= THROTTLE_MS) {
            this.lastDragUpdate = Date.now();

            this.socket.send(
                JSON.stringify({
                    type: "update",
                    roomId: this.roomId,
                    message: selectedMessage,
                })
            );
        }
    }
}