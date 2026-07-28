import axios from "axios";
import { BE_SERVER } from "../config";

export async function getExistingShapes(roomId: string){
    // console.log("frontend", roomId);
    const res = await axios.get(`${BE_SERVER}/api/chats/${roomId}`);   
    // console.log("API response:", res.data); 
    const messages = res.data.chats || [];

    const shapes = messages.map((x: {message: string})=>{
        const messageData = JSON.parse(x.message);
        return messageData.shape;
    })
    return shapes;
}