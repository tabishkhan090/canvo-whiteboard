// import { useEffect, useRef } from "react"
import { RoomCanvas } from "../../../components/RoomCanvas";

export default async function CanvasPage({ params }: {
    params: {
        roomId: string
    }
}){
    const roomId = (await params).roomId;
    console.log(roomId, "Fwef");
    return <RoomCanvas roomId={roomId}/>
}