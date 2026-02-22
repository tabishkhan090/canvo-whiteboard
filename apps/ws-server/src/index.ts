import { JWT_SECRET } from "@repo/backend-common/config"
import jwt from "jsonwebtoken"
import {WebSocket, WebSocketServer} from "ws"
import { prisma } from "@repo/db/prisma"

const wss = new WebSocketServer({port: 8080});

