import { CreateRoomSchema } from "@repo/common/types"
import { prisma } from "@repo/db/prisma"
import { getServerSession, User } from "next-auth";
import { NextRequest } from "next/server"
import { NEXT_AUTH_CONFIG } from "../../../lib/auth";

export async function POST(request: NextRequest){
    try{
        const session = await getServerSession(NEXT_AUTH_CONFIG);
        if(!session || !session.user){
            return Response.json(
                {
                    success: false,
                    message: 'Not Authenticated'
                },
                {
                    status: 401
                }
            )
        }
        const user: User = session.user;
        const userId = user.id;
        const body = await request.json();
        const parseData = CreateRoomSchema.safeParse(body);
        if(!parseData.success){
            return Response.json(
                {
                    success: false,
                    message: "Invalid room name"
                },
                {
                    status: 400
                }
            )
        }
        const existingRoom = await prisma.room.findFirst({
            where: {
                slug: parseData.data.name
            }
        })
        if(existingRoom){
            return Response.json(
                {
                    success: false,
                    message: "Room name already exist"
                },
                {
                    status: 400
                }
            )
        }
        const room = await prisma.room.create({
            data: {
                slug: parseData.data.name,
                adminId: userId
            }
        })
        return Response.json(
            {
                success: true,
                roomId: room.id
            },
            {
                status: 201
            }
        )
    }catch(error){
        return Response.json(
            {
                success: false,
                message: 'Something went wrong'
            },
            {
                status: 500
            }
        )
    }
}