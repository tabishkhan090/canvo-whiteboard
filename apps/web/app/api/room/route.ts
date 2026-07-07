import { CreateRoomSchema } from "@repo/common/types"
import { prisma } from "@repo/db/prisma"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest){
    try{
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
                adminId: "2323"
            }
        })
        Response.json(
            {
                success: true,
                roomId: room.id
            },
            {
                status: 201
            }
        )
    }catch(error){

    }
}