import { CreateUserSchema } from "@repo/common/types"
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db/prisma"
import bcrypt from "bcrypt"

export async function POST(request: NextRequest){
    try{
        const body = await request.json();
        const parseData = CreateUserSchema.safeParse(body);
        if(!parseData.success){
            return Response.json(
                {
                success: false,
                mesaage: "Invalid Input"
                },
                {
                    status: 400
                }
            )
        }
        const { email, username, password } = parseData.data;
        const existingUserByUsername = await prisma.user.findFirst({
            where:{
                username,
                isVerified: true

            }
        });
        if(existingUserByUsername){
            Response.json(
                {
                    success: false,
                    message: "Username already exist"
                },
                {
                    status: 400
                }
            )
        }
        const existingUserByEmail = await prisma.user.findFirst({
            where: {
                email
            }
        })
        const varifyCode = Math.floor(100000 + Math.random() * 900000);
        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                Response.json(
                    {
                        success: false,
                        messsage: "Email already exist"
                    },
                    {
                        status: 400
                    }
                )
            }else{
                // const codeExpiry = 
                existingUserByEmail.isVerified = true; //hardcoded for now
            }
        }else{
            const hashpassword = await bcrypt.hash(password,5);
            const expirydate = new Date();
            expirydate.setHours(expirydate.getHours() + 1);
            await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashpassword,
                    isVerified: true,
                }
            })

            //email verificstion
            //->>
            
            return Response.json(
                {
                    success: true,
                    message: 'User registered successfully. Please verify your account.',
                },
                { status: 201 }
            );
        }
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