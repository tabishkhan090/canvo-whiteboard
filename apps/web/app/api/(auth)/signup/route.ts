import { CreateUserSchema } from "@repo/common/types"
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db/prisma"

export async function POST(request: NextRequest){
    try{
        const body = await request.json();
        const parseData = CreateUserSchema.safeParse(body);
        if(!parseData.success){
            return Response.json({
                success: false,
                mesaage: "Invalid Input"
            })
        }
        const { email, name, password } = parseData.data;
        const existingUserByEmail = await prisma.user.findFirst({
            where:{
                email: email
            }
        });
        if(existingUserByEmail){
            return Response.json({
                success: false,
                message: "Email is already exist"
            })
        }

        const user = await prisma.user.create({
            data: {
                email: email,
                password: password,
                name: name
            }
        })

        return Response.json(
            {
                success: true,
                message: 'User registered successfully.'
            },
            {
                status: 201
            }
        )
    }catch(error){
        return Response.json(
            {
                success: false,
                message: "error reg users"
            },
            {
                status: 500
            }
        )
    }   
}