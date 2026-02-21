import { JWT_SECRET } from "@repo/backend-common/config"
import { CreateUserSchema } from "@repo/common/types"
import express from "express"
import { Middleware } from "./middleware";

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) =>{
    
})
app.post("/signin", async (req, res) =>{

})
app.post("/room", Middleware, async (req, res) =>{
    
})

app.listen(3001);