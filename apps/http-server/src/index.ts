import { JWT_SECRET } from "@repo/backend-common/config"
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types"
import express from "express"
import { Middleware } from "./middleware";
import { prisma } from "@repo/db/prisma"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) =>{
    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(400).json({
            success: false,
            message: "Invalid Inputs"
        })
    }
    try{
        const existingUser = await prisma.user.findUnique({
            where: { email: parsedData.data.username }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashPass = await bcrypt.hash(parsedData.data.password, 10);
        const user = await prisma.user.create({
            data: {
                email: parsedData.data.username,
                password: hashPass,
                name: parsedData.data.name,
            }
        })
        return res.json({
            success: true,
            userId: user.id
        })
    }catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
})

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(403).json({
            success: false,
            message: "Invalid Inputs"
        });
    }
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: parsedData.data.username,
            }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User Not Found!"
            });
        }
        const isPassValid = await bcrypt.compare(
            parsedData.data.password,
            user.password
        );
        if (!isPassValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        return res.status(200).json({
            success: true,
            token
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
});

app.post("/room", Middleware, async (req, res) =>{
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(403).json({
            success: false,
            message: "Invalid Inputs"
        });
    }
    try{
        // @ts-ignore
        const userId = req.userId;
        const room = await prisma.room.create({
        data: {
            slug : parsedData.data?.name,
            adminId: userId
        }
    });

    return res.status(200).json({
        roomId: room.id
    })

    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
})

app.listen(3001);