import { JWT_SECRET } from "@repo/backend-common/config"
import jwt from "jsonwebtoken"
import {WebSocket, WebSocketServer} from "ws"

const wss = new WebSocketServer({port: 8080});

