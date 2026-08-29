import { RoughCanvas } from "roughjs/bin/canvas";
import { RoughGenerator } from "roughjs/bin/generator";
import { LineMessage } from "../game";
import { Drawable } from "roughjs/bin/core";

const THROTTLE_MS = 33; 

const DEFAULT_LINE_STYLE = {
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

export class LineManager{
    constructor(
        private ctx: CanvasRenderingContext2D,
        private rc: RoughCanvas,
        private generator: RoughGenerator,
        private socket: WebSocket,
        private roomId: string,
        private lastDragUpdate: number = 0
    ){}

    private createDrawable(
        x1: number,
        y1: number,
        x2: number,
        y2: number
    ): Drawable {
        return this.generator.line(
            x1,
            y1,
            x2,
            y2,
            DEFAULT_LINE_STYLE
        );
    }

    createMessage(
        startX: number,
        startY: number,
        endX: number,
        endY: number
    ): LineMessage {
        const shapeData = this.createDrawable(
            startX,
            startY,
            endX,
            endY
        );

        return {
            id: crypto.randomUUID(),
            shape: "line",
            shapeData,
            lineData: {
                x1: startX,
                y1: startY,
                x2: endX,
                y2: endY,
            },
        };
    }

    render(message: LineMessage) {
        this.ctx.save();
        this.rc.draw(message.shapeData);
        this.ctx.restore();
    }

    renderPreview(
        startX: number,
        startY: number,
        endX: number,
        endY: number
    ) {
        const drawable = this.createDrawable(
            startX,
            startY,
            endX,
            endY
        );

        this.rc.draw(drawable);
    }

    hitTest(
        msg: LineMessage,
        px: number,
        py: number
    ): boolean {
        const { x1, y1, x2, y2 } = msg.lineData;

        const dx = x2 - x1;
        const dy = y2 - y1;

        const lengthSquared = dx * dx + dy * dy;

        if (lengthSquared === 0) {
            return Math.hypot(px - x1, py - y1) <= 6;
        }

        let t =
            ((px - x1) * dx + (py - y1) * dy) /
            lengthSquared;

        t = Math.max(0, Math.min(1, t));

        const closestX = x1 + t * dx;
        const closestY = y1 + t * dy;

        const distance = Math.hypot(
            px - closestX,
            py - closestY
        );

        return distance <= 6;
    }

    handleDrag(
        selectedMessage: LineMessage,
        dx: number,
        dy: number
    ) {
        const { x1, y1, x2, y2 } = selectedMessage.lineData;

        selectedMessage.lineData = {
            x1: x1 + dx,
            y1: y1 + dy,
            x2: x2 + dx,
            y2: y2 + dy,
        };

        selectedMessage.shapeData = this.createDrawable(
            x1 + dx,
            y1 + dy,
            x2 + dx,
            y2 + dy
        );

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