import { prisma } from "@repo/db/prisma"
import { getServerSession, User } from "next-auth";
import { NextRequest } from "next/server";
import { NEXT_AUTH_CONFIG } from "../../../../lib/auth";

export async function GET(Request: NextRequest, {params}: {params :{roomid: string}}){
    const roomId = params.roomid;
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    if(!session || !session.user){
        return Response.json(
            {
                success: false,
                message: 'Not Authorised'
            },
            {
                status: 401
            }
        )
    }
    try{
        const chats = prisma.chat.findMany({
            where: {
                roomId: Number(roomId)
            },
            orderBy: {
                id: 'desc'
            },
            take : 100
        })
        return Response.json(
            {
                success: true,
                chats
            },
            {
                status: 202
            }
        )
    }catch(error){
        console.log(error);
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