import { prisma } from "@repo/db/prisma"
import { getServerSession, User } from "next-auth";
import { NextRequest } from "next/server";
import { NEXT_AUTH_CONFIG } from "../../../../lib/auth";

export async function GET(request: NextRequest, {params} : {params: { slug: string}}){
    const slug = params.slug;
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
        const room = await prisma.room.findFirst({
            where: {
                slug: slug
            }
        })

        return Response.json(
            {
                sucess: true,
                roomId: room?.id
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